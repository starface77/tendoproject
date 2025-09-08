import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7
}) => {
  if (totalPages <= 1) return null

  const generatePageNumbers = () => {
    const pages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }
    
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('ellipsis-start')
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = generatePageNumbers()

  const PageButton = ({ page, isCurrent = false, isDisabled = false, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`min-w-[40px] h-10 px-3 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${
        isCurrent
          ? 'bg-blue-600 text-white shadow-md'
          : isDisabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex items-center justify-between bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
      
      {/* Mobile pagination info */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назад
        </button>
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Страница {currentPage} из {totalPages}
          </span>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Далее
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        
        {/* Results info */}
        <div>
          <p className="text-sm text-gray-700">
            Страница <span className="font-medium">{currentPage}</span> из{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          
          {/* First page */}
          {showFirstLast && currentPage > 3 && (
            <>
              <PageButton
                onClick={() => onPageChange(1)}
              >
                1
              </PageButton>
              {currentPage > 4 && (
                <div className="px-2">
                  <FiMoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </>
          )}

          {/* Previous */}
          {showPrevNext && (
            <PageButton
              onClick={() => onPageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              <FiChevronLeft className="w-4 h-4" />
            </PageButton>
          )}

          {/* Page numbers */}
          {pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <div key={page} className="px-2">
                  <FiMoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )
            }
            
            return (
              <PageButton
                key={page}
                isCurrent={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PageButton>
            )
          })}

          {/* Next */}
          {showPrevNext && (
            <PageButton
              onClick={() => onPageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              <FiChevronRight className="w-4 h-4" />
            </PageButton>
          )}

          {/* Last page */}
          {showFirstLast && currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <div className="px-2">
                  <FiMoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <PageButton
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </PageButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagination




