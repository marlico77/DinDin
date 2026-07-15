interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ size = 48, className = '' }: LoadingSpinnerProps) => {
  // Comprimento aproximado dos paths
  const path1Length = 60; // Retângulo externo
  const path2Length = 22; // Linha horizontal
  const path3Length = 12.57; // Círculo (2πr ≈ 12.57)

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="wallet-loader"
        >
          {/* Path base (cinza) - sempre visível */}
          <path
            d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
          />
          <path
            d="M1 10H23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
          />
          <circle
            cx="18"
            cy="10"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-300"
          />
          
          {/* Path animado (azul preenchendo) */}
          <path
            d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600"
            style={{
              strokeDasharray: path1Length,
              strokeDashoffset: path1Length,
              animation: 'fillWallet 2s ease-in-out infinite',
            }}
          />
          <path
            d="M1 10H23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600"
            style={{
              strokeDasharray: path2Length,
              strokeDashoffset: path2Length,
              animation: 'fillWallet 2s ease-in-out infinite 0.4s',
            }}
          />
          <circle
            cx="18"
            cy="10"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary-600"
            style={{
              strokeDasharray: path3Length,
              strokeDashoffset: path3Length,
              animation: 'fillWallet 2s ease-in-out infinite 0.8s',
            }}
          />
        </svg>
      </div>
    </div>
  );
};

