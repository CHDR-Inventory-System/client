import '../../scss/item-image-list.scss';
import React, { useMemo, useState } from 'react';
import { Image, Button, Modal, notification } from 'antd';
import SimpleBar from 'simplebar-react';
import useInventory from '../../hooks/inventory';
import { UseLoadingHook } from '../../hooks/loading';
import ImageUploadModal from './ImageUploadModal';

type ItemImageListProps = {
  itemId: number;
  loader: UseLoadingHook;
};

const ItemImageList = ({ itemId, loader }: ItemImageListProps): JSX.Element => {
  const [isUploadModalVisible, setShowUploadModal] = useState(false);
  const inventory = useInventory();
  const images = useMemo(() => inventory.getImages(itemId), [itemId, inventory.items]);

  const deleteImage = async (imageId: number) => {
    loader.startLoading();

    try {
      await inventory.deleteImage(itemId, imageId);
    } catch (err) {
      notification.error({
        key: 'delete-image-error',
        message: 'Error Deleting Image',
        description: 'An error occurred while deleting this image, please try again.'
      });
    }

    loader.stopLoading();
  };

  const showDeleteModal = (imageId: number) => {
    Modal.confirm({
      maskClosable: true,
      title: 'Delete Image',
      content: 'Are you sure you want to delete this image?',
      onOk: () => {
        deleteImage(imageId);
      },
      okText: 'Yes, Delete'
    });
  };

  return (
    <div className="item-image-list">
      <ImageUploadModal
        visible={isUploadModalVisible}
        onClose={() => setShowUploadModal(false)}
        itemId={itemId}
      />
      <p className="title">Images</p>
      {images.length > 0 ? (
        <SimpleBar>
          <div className="images">
            <Image.PreviewGroup>
              {images.map(image => (
                <div className="image-wrapper" key={image.ID}>
                  <Image
                    width={200}
                    height={200}
                    className="item-image"
                    src={image.imageURL}
                    // eslint-disable-next-line global-require
                    fallback={require('../../assets/images/no-image-placeholder.png')}
                  />
                  <Button
                    danger
                    disabled={loader.isLoading}
                    onClick={() => showDeleteModal(image.ID)}
                    className="image-delete-button"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </Image.PreviewGroup>
          </div>
        </SimpleBar>
      ) : (
        <p className="title title--centered">No images to display</p>
      )}
      <Button
        type="primary"
        className="image-upload-button"
        disabled={loader.isLoading}
        onClick={() => setShowUploadModal(true)}
      >
        Upload Image
      </Button>
    </div>
  );
};

export default ItemImageList;
