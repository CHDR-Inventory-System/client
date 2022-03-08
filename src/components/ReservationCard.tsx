import '../scss/item-card.scss';
import '../scss/reservation-card.scss';
import React, { useState } from 'react';
import { Card, Image, Button, Modal, notification } from 'antd';
import moment from 'moment';
import { Reservation } from '../types/API';
import useLoader from '../hooks/loading';
import useReservations from '../hooks/reservation';

type ReservationCardProps = {
  reservation: Reservation;
};

// The server returns GMT dates so we need to add 5 hours to convert it to EST
const formatDate = (date: string) =>
  moment(date).add({ hours: 5 }).format('MMM D, YYYY, hh:mm A');

const ReservationCard = ({ reservation }: ReservationCardProps): JSX.Element => {
  const { item } = reservation;
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const loader = useLoader();
  const res = useReservations();

  const cancelReservation = async () => {
    if (loader.isLoading) {
      return;
    }

    loader.startLoading();

    try {
      await res.updateStatus({
        reservationId: reservation.ID,
        status: 'Cancelled'
      });

      notification.success({
        key: 'reservation-cancel-success',
        message: 'Reservation Cancelled',
        description: (
          <div>
            Your reservation for <b>{reservation.item.name}</b> was cancelled.
          </div>
        )
      });
    } catch {
      notification.error({
        key: 'reservation-cancel-error',
        message: 'Error Cancelling Reservation',
        description:
          'An error occurred while cancelling this reservation, please try again.'
      });
    }

    loader.stopLoading();
  };

  const confirmDCancelReservation = () => {
    Modal.confirm({
      centered: true,
      maskClosable: true,
      maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 50%)'
      },
      title: 'Cancel Reservation',
      content: (
        <p>
          Are you sure you want to cancel your reservation for <b>{item.name}</b>? This
          action cannot be undone.
        </p>
      ),
      okText: 'Cancel Reservation',
      cancelText: 'Close',
      okButtonProps: {
        className: 'ant-btn-dangerous'
      },
      onOk: () => cancelReservation()
    });
  };

  return (
    <Card className="reservation-card item-card" bordered={false}>
      <Image
        className="item-image"
        preview={{ visible: false }}
        width={300}
        height={200}
        src={item.images[0]?.imageURL || ''}
        // eslint-disable-next-line global-require
        fallback={require('../assets/images/no-image-placeholder.png')}
        onClick={() => setPreviewVisible(true)}
      />
      <div style={{ display: 'none' }}>
        {item.images.length > 0 && (
          <Image.PreviewGroup
            preview={{
              visible: isPreviewVisible,
              onVisibleChange: visible => setPreviewVisible(visible)
            }}
          >
            {item.images.map(image => (
              <Image src={image.imageURL} key={image.ID} />
            ))}
          </Image.PreviewGroup>
        )}
      </div>
      <h2>{item.name}</h2>
      <p>
        <b>Status</b>: {reservation.status}
      </p>
      <p>
        <b>Checkout</b>: {formatDate(reservation.startDateTime)}
      </p>
      <p>
        <b>Return</b>: {formatDate(reservation.endDateTime)}
      </p>
      {reservation.status === 'Pending' && (
        <Button
          type="primary"
          className="cancel-button"
          onClick={confirmDCancelReservation}
        >
          Cancel Reservation
        </Button>
      )}
    </Card>
  );
};

export default ReservationCard;
