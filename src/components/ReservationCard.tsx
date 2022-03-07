/* eslint-disable */
import '../scss/item-card.scss';
import React, { useState } from 'react';
import { Card, Image, Button } from 'antd';
import { Reservation } from '../types/API';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import moment from 'moment';

type ReservationCardProps = {
  reservation: Reservation;
};

// The server returns GMT dates so we need to add 5 hours to convert it to EST
const formatDate = (date: string) =>
  moment(date).add({ hours: 5 }).format('MMM D, YYYY, hh:mm A');

const ReservationCard = ({ reservation }: ReservationCardProps): JSX.Element => {
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const item = reservation.item;

  return (
    <Card className="item-card" bordered={false}>
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
      <Button
        type="primary"
        className="reserve-button"
        disabled={reservation.status !== 'Pending'}
      >
        Cancel Reservation
      </Button>
    </Card>
  );
};

export default ReservationCard;
