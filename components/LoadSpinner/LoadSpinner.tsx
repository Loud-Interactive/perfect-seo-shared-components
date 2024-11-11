const LoadSpinner = () => {

  return (
    <div className="load-overlay">
      <div>
        <div className="spinner-border" role="status">
          <span className="d-none">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default LoadSpinner