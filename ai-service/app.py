import os
import base64
import tempfile
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import mediapipe as mp

# ── FastAPI setup ─────────────────────────────────────────────────────────────
app = FastAPI(title="PashuBazaar CV AI Service", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models setup ──────────────────────────────────────────────────────────────
# Load YOLOv8 model for animal detection
# yolov8n.pt will be downloaded automatically on first run if missing
yolo_model = YOLO("best.pt")

# Initialize MediaPipe Pose with graceful fallback for newer API versions
has_mediapipe = False
try:
    # Try importing solutions explicitly
    from mediapipe.python.solutions import pose as mp_pose
    pose_estimator = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5
    )
    has_mediapipe = True
except Exception as e:
    print(f"Warning: MediaPipe Pose initialization failed ({e}). Pose estimation will be skipped.")
    pose_estimator = None

# ── Helper functions ──────────────────────────────────────────────────────────

def analyze_image_clarity(image: np.ndarray) -> float:
    """Returns a score 0-100 based on Laplacian variance (blur detection)."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Typical threshold for blur is 100. 
    # Variance of 500+ is very sharp.
    clarity_score = min((variance / 500.0) * 100, 100.0)
    return max(0.0, clarity_score)

def detect_livestock_yolo(image: np.ndarray):
    """Detects livestock using YOLOv8. Returns max confidence and bounding box area ratio."""
    results = yolo_model(image, verbose=False)
    
    max_conf = 0.0
    best_box_area_ratio = 0.0
    img_h, img_w = image.shape[:2]
    img_area = img_h * img_w
    
    for r in results:
        boxes = r.boxes
        for box in boxes:
            conf = float(box.conf[0])
            
            if conf > max_conf:
                max_conf = conf
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                box_area = (x2 - x1) * (y2 - y1)
                best_box_area_ratio = min((box_area / img_area), 1.0)

    if max_conf > 0:
        # Normalize box area ratio to 0-100 score. 
        # A good close-up might cover 30-60% of the image.
        size_score = min((best_box_area_ratio / 0.5) * 100, 100.0)
    else:
        size_score = 0.0
        
    return max_conf, size_score

def analyze_posture(image: np.ndarray) -> float:
    """Estimates posture using MediaPipe. Returns a 0-100 score."""
    if pose_estimator is None:
        return 50.0  # Neutral score if MediaPipe is not installed/loading
        
    # Convert BGR to RGB for MediaPipe
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose_estimator.process(image_rgb)
    
    if not results.pose_landmarks:
        # No pose detected, maybe not an animal or too occluded
        return 50.0 # Neutral score if pose fails
        
    landmarks = results.pose_landmarks.landmark
    xs = [lm.x for lm in landmarks if lm.visibility > 0.5]
    ys = [lm.y for lm in landmarks if lm.visibility > 0.5]
    
    if len(xs) < 3:
        return 50.0
        
    width = max(xs) - min(xs)
    height = max(ys) - min(ys)
    
    # If height > width, likely standing (healthy posture)
    # If width > height * 1.5, likely lying down / abnormal
    if height > width:
        return 95.0
    elif width > height * 1.5:
        # Lying down or anomalous aspect ratio
        return 40.0
    else:
        return 75.0

def analyze_motion(frames: list) -> float:
    """Measures motion between consecutive frames using frame differencing. Returns 0-100 score."""
    if len(frames) < 2:
        return 50.0
        
    motion_scores = []
    for i in range(1, len(frames)):
        gray1 = cv2.cvtColor(frames[i-1], cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        
        diff = cv2.absdiff(gray1, gray2)
        _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
        
        # Calculate percentage of pixels that changed
        changed_pixels = np.sum(thresh > 0)
        total_pixels = thresh.size
        motion_ratio = changed_pixels / total_pixels
        
        motion_scores.append(motion_ratio)
        
    avg_motion = np.mean(motion_scores)
    # Scaled from 0.005 to 0.15 threshold
    if avg_motion < 0.005:
        return 30.0 # very little movement
    elif avg_motion > 0.15:
        return 85.0 # lots of movement (active)
    else:
        score = 50.0 + ((avg_motion - 0.005) / 0.145) * 45.0
        return min(score, 100.0)


# ── Core Pipeline ─────────────────────────────────────────────────────────────

def process_image_pipeline(image: np.ndarray) -> dict:
    """Runs the full computer vision pipeline on a single image and returns final scores."""
    
    # 1. Detection & Body Size
    conf, size_score = detect_livestock_yolo(image)
    
    # Handle missing detection
    if conf < 0.2:
        return {
            "healthScore": 30,
            "status": "risk",
        }
    
    # 2. Clarity
    clarity_score = analyze_image_clarity(image)
    
    # 3. Pose
    pose_score = analyze_posture(image)
    
    # Scoring calculation for Image
    # YOLO confidence -> 30%
    # Body size -> 25% (Adjusted from 20 to fill missing motion)
    # Pose estimation -> 25% (Adjusted from 15 to fill missing motion)
    # Image clarity -> 20% (Adjusted from 10 to fill missing motion)
    
    conf_score = conf * 100
    
    final_score = (
        (conf_score * 0.30) +
        (size_score * 0.25) +
        (pose_score * 0.25) +
        (clarity_score * 0.20)
    )
    
    final_score = int(round(max(0, min(100, final_score))))
    # Adjusted thresholds for better accuracy - 57+ is moderate quality
    status = "healthy" if final_score > 70 else ("moderate" if final_score >= 45 else "risk")
    
    return {
        "healthScore": final_score,
        "status": status
    }

def process_video_pipeline(video_bytes: bytes) -> dict:
    """Extracts frames from video and applies the spatial and temporal AI pipelines."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name
        
    frames = []
    try:
        cap = cv2.VideoCapture(tmp_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            raise ValueError("Invalid video file")
            
        # Sample up to 10 frames evenly spaced
        sample_count = min(10, total_frames)
        step = max(1, total_frames // sample_count)
        
        for i in range(sample_count):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i * step)
            ret, frame = cap.read()
            if ret:
                # Resize frame to speed up processing
                frame = cv2.resize(frame, (640, 480))
                frames.append(frame)
        cap.release()
    except Exception as e:
        print(f"Video extraction error: {e}")
        return {"healthScore": 40, "status": "risk"}
    finally:
        os.remove(tmp_path)
        
    if not frames:
        return {"healthScore": 40, "status": "risk"}

    # Evaluate spatial features on the middle frame
    mid_frame = frames[len(frames) // 2]
    conf, size_score = detect_livestock_yolo(mid_frame)
    
    if conf < 0.2:
        return {
            "healthScore": 30,
            "status": "risk"
        }
        
    clarity_score = analyze_image_clarity(mid_frame)
    pose_score = analyze_posture(mid_frame)
    
    # Measure motion across sampled frames
    motion_score = analyze_motion(frames)
    
    # Original Scoring System from prompt:
    # YOLO (30%), Size (20%), Motion (25%), Pose (15%), Clarity (10%)
    conf_score = conf * 100
    
    final_score = (
        (conf_score * 0.30) +
        (size_score * 0.20) +
        (motion_score * 0.25) +
        (pose_score * 0.15) +
        (clarity_score * 0.10)
    )
    
    final_score = int(round(max(0, min(100, final_score))))
    # Adjusted thresholds for better accuracy
    status = "healthy" if final_score > 70 else ("moderate" if final_score >= 45 else "risk")
    
    return {
        "healthScore": final_score,
        "status": status
    }


# ── Label Mapping ────────────────────────────────────────────────────────────
# Maps user-facing livestock types to YOLOv8 COCO class names.
# YOLOv8n COCO classes relevant to livestock:
#   cow, sheep, horse, bird, bear, elephant, zebra, giraffe
# Approximations used where COCO has no exact match:
#   goat → sheep (visually closest), pig → bear (rough proxy),
#   camel → camel (only in larger models), buffalo → cow

LIVESTOCK_LABEL_MAP: dict[str, list[str]] = {
    "cattle":  ["cow"],
    "buffalo": ["cow"],
    "goat":    ["sheep"],
    "sheep":   ["sheep"],
    "pig":     ["bear"],
    "poultry": ["bird"],
    "horse":   ["horse"],
    "camel":   ["camel"],
    "other":   [],  # empty = accept any animal class (non-person/object)
    "auto":    [],  # same as other — accept any, then reverse-map to friendly name
}

# COCO classes considered "animals" (exclude persons, vehicles, furniture, etc.)
# This is the full list of COCO animal classes YOLO nano can recognise.
ANIMAL_CLASSES = {
    "bird", "cat", "dog", "horse", "sheep", "cow",
    "elephant", "bear", "zebra", "giraffe", "camel",
}

# Friendly display names for AUTO-DETECT mode.
# These reflect the ACTUAL animal — no proxy substitutions.
COCO_FRIENDLY_NAMES: dict[str, str] = {
    "cow":      "Cattle",
    "sheep":    "Sheep",
    "horse":    "Horse",
    "bird":     "Bird / Poultry",
    "bear":     "Bear",       # NOT "Pig" — bear is the real label
    "camel":    "Camel",
    "elephant": "Elephant",
    "dog":      "Dog",
    "cat":      "Cat",
    "zebra":    "Zebra",
    "giraffe":  "Giraffe",
}

# Proxy names for MANUAL mode bbox labels (e.g. bear → "Pig" because user selected Pig).
# Only used when a specific livestock type is pre-selected.
COCO_TO_LIVESTOCK: dict[str, str] = {
    "cow":      "Cattle",
    "sheep":    "Sheep / Goat",
    "horse":    "Horse",
    "bird":     "Poultry",
    "bear":     "Pig",        # proxy: COCO has no pig class
    "camel":    "Camel",
    "elephant": "Elephant",
    "dog":      "Dog",
    "cat":      "Cat",
    "zebra":    "Zebra",
    "giraffe":  "Giraffe",
}

# ── Routes ────────────────────────────────────────────────────────────────────

class FrameRequest(BaseModel):
    frame_b64: str                    # Base64-encoded JPEG frame
    livestock_type: str = "other"     # e.g. "cattle", "goat", "sheep"


@app.get("/")
def root():
    return {"message": "PashuBazaar CV AI Service (YOLOv8 + MediaPipe) is running", "version": "3.0.0"}


@app.post("/analyze-frame")
async def analyze_frame(req: FrameRequest):
    """
    Accept a single base64-encoded JPEG frame from live recording.
    Filters detections by livestock_type. Returns metadata for real-time overlay.
    """
    try:
        # Decode base64 → numpy image
        img_bytes = base64.b64decode(req.frame_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid frame data")

        # Resize to 640×480 for speed
        img = cv2.resize(img, (640, 480))
        img_h, img_w = img.shape[:2]

        # ── Blur rejection ────────────────────────────────────────────────────
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if blur_score < 80.0:
            return {
                "detected": False,
                "is_blurry": True,
                "confidence": 0.0,
                "bbox": None,
                "pose_score": 50.0,
                "status_text": "Frame too blurry",
                "matched_label": None,
            }

        # ── YOLO detection ────────────────────────────────────────────────────
        livestock_type = (req.livestock_type or "other").lower()
        target_labels = LIVESTOCK_LABEL_MAP.get(livestock_type, [])
        accept_any = (livestock_type == "other" or not target_labels)

        results = yolo_model(img, verbose=False)
        max_conf = 0.0
        best_bbox = None
        matched_label = None
        wrong_animal_seen = False   # a non-target animal was detected

        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                label = yolo_model.names[int(box.cls[0])].lower()

                is_target = accept_any and label in ANIMAL_CLASSES
                if not accept_any:
                    is_target = label in target_labels

                if is_target and conf > max_conf:
                    max_conf = conf
                    matched_label = label
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    best_bbox = {
                        "x": x1 / img_w,
                        "y": y1 / img_h,
                        "width":  (x2 - x1) / img_w,
                        "height": (y2 - y1) / img_h,
                    }
                elif not is_target and label in ANIMAL_CLASSES and conf > 0.25:
                    # A different animal is visible
                    wrong_animal_seen = True

        detected = max_conf >= 0.25

        # ── Pose score ────────────────────────────────────────────────────────
        pose_score = 50.0
        if detected:
            pose_score = analyze_posture(img)

        # ── Status text + detected_type ────────────────────────────────────────────
        is_auto = livestock_type in ("auto", "other")
        type_label = livestock_type.capitalize()

        # detected_type: what to display on the bounding box
        detected_type = None
        if matched_label:
            if is_auto:
                # Auto mode: show the actual animal name, never a proxy
                detected_type = COCO_FRIENDLY_NAMES.get(matched_label, matched_label.capitalize())
            else:
                # Manual mode: show the user's selected livestock name as the label
                detected_type = COCO_TO_LIVESTOCK.get(matched_label, matched_label.capitalize())

        if not detected:
            if wrong_animal_seen:
                status_text = f"Please scan a {type_label}" if not is_auto else "No animal detected"
            else:
                status_text = "No livestock detected"
        elif pose_score < 50:
            status_text = "Unstable posture detected"
        elif max_conf > 0.6:
            status_text = "Tracking active"
        else:
            status_text = f"{detected_type or type_label} detected"

        return {
            "detected":       detected,
            "is_blurry":      False,
            "confidence":     round(max_conf, 3),
            "bbox":           best_bbox,
            "pose_score":     round(pose_score, 1),
            "status_text":    status_text,
            "matched_label":  matched_label,
            "detected_type":  detected_type,   # friendly name, e.g. "Cattle"
            "wrong_animal":   wrong_animal_seen and not detected,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Frame analysis failed: {str(e)}")


class AnalyzeRequest(BaseModel):
    images: list[str]                 # List of base64-encoded images
    animalType: str = "other"         # e.g. "cattle", "goat", "sheep"
    breed: str = ""                   # e.g. "Holstein", "Angus"


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """
    Accept a list of base64-encoded images and return a computer vision based health score.
    Accepts JSON with images array, animalType, and breed.
    """
    if not req.images or len(req.images) == 0:
        raise HTTPException(status_code=400, detail="No images provided for analysis")

    try:
        print(f"[ANALYZE] Started analysis for {req.animalType}, Breed: {req.breed}")
        print(f"[ANALYZE] Received {len(req.images)} images")
        
        all_results = []
        
        for idx, image_b64 in enumerate(req.images):
            try:
                print(f"[ANALYZE] Processing image {idx + 1}/{len(req.images)}")
                
                # Decode base64 → numpy image
                img_bytes = base64.b64decode(image_b64)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    print(f"[ANALYZE] Warning: Image {idx + 1} decode failed, skipping")
                    continue
                
                print(f"[ANALYZE] Image {idx + 1} decoded: {img.shape}")
                
                # Resize if too large
                h, w = img.shape[:2]
                if w > 1280 or h > 1280:
                    scale = 1280 / max(w, h)
                    img = cv2.resize(img, (int(w * scale), int(h * scale)))
                
                # Run analysis on this image
                print(f"[ANALYZE] Running health analysis on image {idx + 1}")
                result = process_image_pipeline(img)
                all_results.append(result)
                print(f"[ANALYZE] Image {idx + 1} health score: {result['healthScore']}")
                
            except Exception as e:
                print(f"[ANALYZE] Error processing image {idx + 1}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"[ANALYZE] Processed {len(all_results)} images successfully")
        
        if not all_results:
            print(f"[ANALYZE] ERROR: Could not process any images")
            raise ValueError("Could not process any of the provided images. Please ensure images are in valid format.")
        
        # Average results across all images
        avg_health_score = int(round(sum(r["healthScore"] for r in all_results) / len(all_results)))
        # Use the most common status
        statuses = [r["status"] for r in all_results]
        final_status = max(set(statuses), key=statuses.count) if statuses else "unknown"
        
        print(f"[ANALYZE] Final health score: {avg_health_score}, Status: {final_status}")
        
        return {
            "healthScore": avg_health_score,
            "status": final_status,
            "analysis": f"Analyzed {len(all_results)} image(s). Animal type: {req.animalType}, Breed: {req.breed}"
        }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)