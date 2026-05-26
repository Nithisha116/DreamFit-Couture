// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('🚨 [ErrorBoundary] Caught error:', error);
    console.error('🚨 [ErrorBoundary] Component stack:', errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
                <p className="text-sm text-slate-500">An error occurred in this section</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-xs font-mono text-red-700 overflow-auto max-h-40">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-red-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
