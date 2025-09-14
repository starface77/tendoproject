import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import AdvancedSearch from '../components/search/AdvancedSearch';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const AdvancedSearchPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Состояния
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchStats, setSearchStats] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // grid или list
  
  // Получаем параметры из URL
  const initialFilters = {
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    material: searchParams.get('material') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    isNew: searchParams.get('isNew') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20
  };

  // Выполняем поиск при загрузке страницы
  useEffect(() => {
    if (initialFilters.query || hasActiveFilters(initialFilters)) {
      handleSearch(initialFilters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = (filters) => {
    return Object.entries(filters).some(([key, value]) => {
      if (['page', 'limit', 'sortBy'].includes(key)) return false;
      if (typeof value === 'boolean') return value;
      return value && value !== '';
    });
  };

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);

    try {
      // Обновляем URL
      updateURL(searchParams);

      console.log('🔍 Выполняю продвинутый поиск:', searchParams);

      // Отправляем запрос на backend
      const response = await fetch('/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...searchParams,
          page: searchParams.page || 1,
          limit: searchParams.limit || 20
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || {});
        setSearchStats(data.data.stats || {});
        
        console.log(`✅ Найдено товаров: ${data.data.products?.length || 0}`);
        
        // Логируем поисковый запрос для аналитики
        logSearchQuery(searchParams, data.data.products?.length || 0);
        
      } else {
        throw new Error(data.error || 'Ошибка поиска');
      }

    } catch (error) {
      console.error('Ошибка поиска:', error);
      setError(error.message || 'Произошла ошибка при поиске');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (filters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  };

  const logSearchQuery = async (searchParams, resultCount) => {
    try {
      await fetch('/api/v1/search/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchParams.query,
          results: resultCount,
          filters: searchParams
        })
      });
    } catch (error) {
      // Ошибки логирования не критичны
      console.log('Не удалось залогировать поиск:', error.message);
    }
  };

  const handleFilterChange = (newFilters) => {
    const searchParamsWithFilters = {
      ...newFilters,
      page: 1 // Сбрасываем страницу при изменении фильтров
    };
    handleSearch(searchParamsWithFilters);
  };

  const handlePageChange = (newPage) => {
    const searchParamsWithPage = {
      ...initialFilters,
      page: newPage
    };
    handleSearch(searchParamsWithPage);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            {t('search.back', 'Назад')}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t('search.title', 'Поиск товаров')}
          </h1>

          {/* Компонент продвинутого поиска */}
          <AdvancedSearch
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            initialFilters={initialFilters}
          />
        </div>
      </div>

      {/* Результаты поиска */}
      <div className="container-custom py-8">
        {/* Статистика и управление */}
        {(products.length > 0 || loading) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              {loading ? (
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {t('search.results_count', 'Найдено товаров')}: <span className="text-blue-600">{pagination.total || 0}</span>
                  </p>
                  {initialFilters.query && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t('search.query_for', 'по запросу')}: "<span className="font-medium">{initialFilters.query}</span>"
                    </p>
                  )}
                  {searchStats.searchTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('search.time', 'Время поиска')}: {searchStats.searchTime}мс
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Переключатель вида */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Загрузка */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => handleSearch(initialFilters)}
              className="mt-4 btn-primary"
            >
              {t('search.try_again', 'Попробовать снова')}
            </button>
          </div>
        )}

        {/* Результаты */}
        {!loading && !error && products.length > 0 && (
          <div className={`${viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-4'
          }`}>
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              {/* Предыдущая страница */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('pagination.previous', 'Предыдущая')}
              </button>

              {/* Номера страниц */}
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const page = pagination.page - 2 + i;
                if (page < 1 || page > pagination.pages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Следующая страница */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('pagination.next', 'Следующая')}
              </button>
            </div>
          </div>
        )}

        {/* Нет результатов */}
        {!loading && !error && products.length === 0 && (initialFilters.query || hasActiveFilters(initialFilters)) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiFilter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('search.no_results', 'Ничего не найдено')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('search.no_results_desc', 'Попробуйте изменить критерии поиска или использовать другие ключевые слова')}
            </p>
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setProducts([]);
                setPagination({});
              }}
              className="btn-primary"
            >
              {t('search.clear_search', 'Очистить поиск')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPage;









