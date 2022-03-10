import '../../scss/no-content.scss';
import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames';

type NoContentProps = {
  icon: React.ReactNode;
  text: string;
  className?: string;
  retryText?: string;
  onRetryClick?: () => void;
};

const NoContent = ({
  icon,
  text,
  className,
  retryText,
  onRetryClick
}: NoContentProps): JSX.Element => (
  <div className={classNames('no-content', className)}>
    {icon}
    <p>{text}</p>
    {retryText && (
      <Button type="primary" onClick={onRetryClick} className="retry-button">
        Retry
      </Button>
    )}
  </div>
);

export default NoContent;
