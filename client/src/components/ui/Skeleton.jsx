import React from 'react';
import clsx from 'clsx';

const Skeleton = ({ className, variant = 'rect', ...props }) => {
    return (
        <div
            className={clsx(
                'animate-pulse bg-slate-200',
                variant === 'circle' ? 'rounded-full' : 'rounded-2xl',
                className
            )}
            {...props}
        />
    );
};

export default Skeleton;
