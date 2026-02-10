import React from 'react';

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
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh', fontFamily: 'sans-serif' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Something went wrong.</h1>
                    <p>The application crashed. Here is the error:</p>
                    <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', overflow: 'auto', border: '1px solid #fca5a5' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
