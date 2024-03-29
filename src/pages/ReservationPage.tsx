import '../scss/reservation-page.scss';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Image, notification } from 'antd';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { BsBoxSeam } from 'react-icons/bs';
import classNames from 'classnames';
import Navbar from '../components/Navbar';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';
import LoadingSpinner from '../components/LoadingSpinner';
import { Item } from '../types/API';
import APIError from '../util/APIError';
import ReservationForm from '../components/reservation-page/ReservationForm';
import useModal from '../hooks/modal';
import ItemAvailabilityModal from '../components/modals/ItemAvailabilityModal';

type ReservationParams = {
  itemId: string;
};

const ReservationPage = (): JSX.Element => {
  const params = useParams<ReservationParams>();
  const inventory = useInventory();
  const loader = useLoader(true);
  const availabilityModal = useModal();
  const [item, setItem] = useState<Item | null>(null);
  const [isImagePreviewVisible, setImagePreviewVisible] = useState(false);

  const fetchItem = async () => {
    loader.startLoading();

    try {
      const response = await inventory.fetchItem(parseInt(params.itemId || '', 10));
      setItem(response);
    } catch (err) {
      const { status } = err as APIError;

      if (status === 500) {
        notification.error({
          key: 'item-load-error',
          message: 'Error Loading Item',
          description: `
            An unexpected error occurred while loading this item,
            refresh the page to try again.
          `
        });
      }
    }

    loader.stopLoading();
  };

  useEffect(() => {
    fetchItem();

    document.title = 'CHDR Inventory - Reservation';

    return () => {
      notification.destroy();
    };
  }, []);

  if (loader.isLoading) {
    return (
      <div className="reservation-page">
        <Navbar />
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="reservation-page">
        <Navbar />
        <div className="invalid-item-container">
          <BsBoxSeam />
          <h1>Item Not Found</h1>
          <p>Uh oh! We couldn&apos;t find the item you were looking for.</p>
          <Link to="/">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Navbar />
      <ItemAvailabilityModal
        item={item}
        visible={availabilityModal.isVisible}
        onClose={availabilityModal.close}
      />
      <div className="container">
        <div className="item-detail">
          <div className="item-detail-sticky-container">
            <Image
              preview={{ visible: false }}
              src={item.images[0]?.imageURL || ''}
              // eslint-disable-next-line global-require
              fallback={require('../assets/images/no-image-placeholder.png')}
              onClick={() => setImagePreviewVisible(true)}
            />
            <div style={{ display: 'none' }}>
              {item.images.length > 0 && (
                <Image.PreviewGroup
                  preview={{
                    visible: isImagePreviewVisible,
                    onVisibleChange: visible => setImagePreviewVisible(visible)
                  }}
                >
                  {item.images.map(image => (
                    <Image src={image.imageURL} key={image.ID} />
                  ))}
                </Image.PreviewGroup>
              )}
            </div>
            <h2 className="item-name">{item.name}</h2>
            <p>
              Status:{' '}
              <span
                className={classNames('item-status', {
                  'item-status-available': item.available,
                  'item-status-unavailable': !item.available
                })}
              >
                {item.available ? 'Available' : 'Unavailable'}
                {item.available ? (
                  <AiFillCheckCircle size={16} />
                ) : (
                  <AiFillCloseCircle size={16} />
                )}
              </span>
            </p>
            <p className="item-quantity">Quantity: {item.quantity}</p>
            <div className="item-description">
              <b>Description</b>
              <p>{item.description || 'No description available'}</p>
            </div>
            <Button
              type="primary"
              className="availability-button"
              onClick={availabilityModal.open}
            >
              View Availability
            </Button>
          </div>
        </div>
        <div className="reservation-container">
          <ReservationForm item={item} />
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
