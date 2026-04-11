from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("yolov8s.pt")

    model.train(
        data="dataset/data.yaml",
        epochs=10,
        imgsz=416,
        batch=6,
        device=0
    )