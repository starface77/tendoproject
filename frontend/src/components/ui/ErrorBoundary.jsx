import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          onRetry={this.handleRetry}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onRetry, error, errorInfo }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <FiAlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('errorBoundary.title', 'Что-то пошло не так')}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {t('errorBoundary.message', 'Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.')}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t('errorBoundary.retry', 'Попробовать снова')}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('errorBoundary.reload', 'Обновить страницу')}
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              {t('errorBoundary.showDetails', 'Показать детали ошибки')}
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error && error.toString()}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;



