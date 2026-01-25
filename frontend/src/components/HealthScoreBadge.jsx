const HealthScoreBadge = ({ score, status, isVerified, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  if (!isVerified || score === null || score === undefined) {
    return (
      <span className={`badge bg-gray-100 text-gray-500 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
        Not Verified
      </span>
    )
  }

  if (status === 'healthy' || score > 85) {
    return (
      <span className={`badge bg-emerald-100 text-emerald-700 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
        Healthy · {score}
      </span>
    )
  }

  if (status === 'moderate' || (score >= 60 && score <= 85)) {
    return (
      <span className={`badge bg-yellow-100 text-yellow-700 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
        Moderate · {score}
      </span>
    )
  }

  return (
    <span className={`badge bg-red-100 text-red-700 ${sizeClasses[size]}`}>
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
      Risk · {score}
    </span>
  )
}

export default HealthScoreBadge
