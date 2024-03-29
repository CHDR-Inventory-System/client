import '../scss/item-card.scss';
import React, { useState } from 'react';
import { Button, Card, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';
import { Item } from '../types/API';

type ItemCardProps = {
  item: Item;
};

const ItemCard = ({ item }: ItemCardProps): JSX.Element => {
  const navigate = useNavigate();
  const [isPreviewVisible, setPreviewVisible] = useState(false);

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
      <h2 className="item-name" title={item.name}>
        {item.name}
      </h2>
      <p className="item-status">
        <b>Status</b>:{' '}
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
      <b>Description</b>
      <p className="item-description" title={item.description || undefined}>
        {item.description || 'No description available'}
      </p>
      <Button
        type="primary"
        className="reserve-button"
        onClick={() => navigate(`/reserve/${item.ID}`)}
      >
        Reserve
      </Button>
    </Card>
  );
};

export default ItemCard;
