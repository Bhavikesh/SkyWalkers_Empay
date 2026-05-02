export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  id,
  type = 'button',
}) {
  const variants = {
    primary:   'bg-purple-600 hover:bg-purple-500 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600',
    success:   'bg-green-600 hover:bg-green-500 text-white',
    danger:    'bg-red-500 hover:bg-red-400 text-white',
    warning:   'bg-amber-500 hover:bg-amber-400 text-gray-900',
    ghost:     'bg-transparent hover:bg-dark-600 text-gray-400 hover:text-white',
    outline:   'bg-transparent border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}
