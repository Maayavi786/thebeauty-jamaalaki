import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export const Logo = ({ variant = 'full', className }: LogoProps) => {
  const { isRtl } = useLanguage();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        className="h-8 w-8 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized J icon with Islamic pattern influence */}
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          fill="currentColor"
        />
        <path
          d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
          fill="currentColor"
        />
      </svg>
      {variant === 'full' && (
        <span className={cn(
          'text-xl font-bold text-primary',
          isRtl ? 'font-tajawal' : 'font-playfair'
        )}>
          {isRtl ? 'جمالكِ' : 'Jamaalaki'}
        </span>
      )}
    </div>
  );
}; 