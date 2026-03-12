import clsx from 'clsx';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-slate-200/60", className)}
      {...props}
    />
  );
};

export default Skeleton;
