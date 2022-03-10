import { Button, Checkbox, Dropdown, Menu } from 'antd';
import React, { useState } from 'react';
import { AiFillFilter } from 'react-icons/ai';
import { ReservationStatus } from '../../types/API';

type StatusFilterButtonProps = {
  className?: string;
  selectedStatuses: ReservationStatus[];
  onSelectStatus: (status: ReservationStatus, selected: boolean) => void;
};

const STATUSES: ReservationStatus[] = [
  'Approved',
  'Cancelled',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

const StatusFilterButton = ({
  className,
  selectedStatuses,
  onSelectStatus
}: StatusFilterButtonProps): JSX.Element => {
  const [visible, setVisible] = useState(false);

  const reservationStatusMenu = (
    <Menu>
      {STATUSES.map(status => (
        <Menu.Item key={status}>
          <Checkbox
            onChange={event => onSelectStatus(status, event.target.checked)}
            checked={selectedStatuses.includes(status)}
          >
            {status}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={reservationStatusMenu}
      trigger={['click']}
      placement="top"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Button
        type="primary"
        className={className}
        title="Filter reservations"
        icon={<AiFillFilter />}
      />
    </Dropdown>
  );
};

export default StatusFilterButton;
