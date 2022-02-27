import '../scss/item-card.scss';
import React from 'react';
import { Button, Card, Image } from 'antd';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { Item } from '../types/API';

type ItemCardProps = {
  item: Item;
};

const ItemCard = ({ item }: ItemCardProps): JSX.Element => {
  return (
    <Card className="item-card" bordered={false}>
      <Image
        className="item-image"
        width="100%"
        height={200}
        src={item.images[0]?.imageURL || ''}
        // eslint-disable-next-line global-require
        fallback={require('../assets/images/no-image-placeholder.png')}
      />
      <h2>{item.name}</h2>
      <p>
        Status:{' '}
        <span
          className={`item-status item-status-${
            item.available ? 'available' : 'unavailable'
          }`}
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
      <Button type="primary" className="reserve-button" disabled={!item.available}>
        Reserve
      </Button>
    </Card>
  );
};

export default ItemCard;
