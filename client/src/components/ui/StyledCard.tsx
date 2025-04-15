import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface StyledCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export const StyledCard = forwardRef<HTMLDivElement, StyledCardProps>(
  ({ className, title, description, imageUrl, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className
        )}
        {...props}
      >
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="p-6">
          {title && (
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }
); 