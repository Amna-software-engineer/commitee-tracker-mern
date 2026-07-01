export default function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination-container">
      <button className="page-btn" onClick={onPrev} disabled={currentPage === 1}>
        Prev
      </button>
      <span id="pageIndicator">
        {currentPage} / {totalPages}
      </span>
      <button className="page-btn" onClick={onNext} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
}
