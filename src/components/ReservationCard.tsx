import '../scss/item-card.scss';
import '../scss/reservation-card.scss';
import React, { useState } from 'react';
import { Card, Image, Button, Modal, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { Reservation } from '../types/API';
import useLoader from '../hooks/loading';
import useReservations from '../hooks/reservation';
import { formatDate } from '../util/date';

type ReservationCardProps = {
  reservation: Reservation;
};

const ReservationCard = ({ reservation }: ReservationCardProps): JSX.Element => {
  const { item } = reservation;
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const loader = useLoader();
  const res = useReservations();
  const navigate = useNavigate();

  const cancelReservation = async () => {
    if (loader.isLoading) {
      return;
    }

    loader.startLoading();

    try {
      await res.update({
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

  const confirmCancelReservation = () => {
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

  const goToReservationPage = () => navigate(`/reserve/${reservation.item.ID}`);

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
        <b>Checkout</b>: {formatDate(Date.parse(reservation.startDateTime))}
      </p>
      <p>
        <b>Return</b>: {formatDate(Date.parse(reservation.endDateTime))}
      </p>
      <Button
        type="primary"
        className={classNames({ 'cancel-button': reservation.status === 'Pending' })}
        onClick={
          reservation.status === 'Pending'
            ? confirmCancelReservation
            : goToReservationPage
        }
      >
        {reservation.status === 'Pending' ? 'Cancel Reservation' : 'New Reservation'}
      </Button>
    </Card>
  );
};

export default ReservationCard;
