import '../../scss/image-upload-modal.scss';
import React, { useEffect, useState } from 'react';
import { Modal, notification, Progress, Tooltip, Upload } from 'antd';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { UploadFile } from 'antd/lib/upload/interface';
import axios from 'axios';
import useLoader from '../../hooks/loading';
import useInventory from '../../hooks/inventory';
import APIError from '../../util/APIError';
import { BaseModalProps } from './base-modal-props';

type ImageUploadModalProps = BaseModalProps & {
  itemId: number;
};

const PROGRESS_NOTIFICATION_KEY = 'upload-progress';

const ImageUploadModal = ({
  visible,
  onClose,
  itemId
}: ImageUploadModalProps): JSX.Element => {
  const inventory = useInventory();
  const loader = useLoader();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(new Image());
  const [cancelTokenSource, setCancelTokenSource] = useState(axios.CancelToken.source());
  const [uploadProgress, setUploadProgress] = useState(-1);

  const onBeforeUpload = (inputFile: File) => {
    setSelectedImage(inputFile);

    const image = new Image();

    image.src = URL.createObjectURL(inputFile);

    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'contain';

    image.onload = () => {
      // Release the image blob to free browser memory
      URL.revokeObjectURL(previewImage.src);
      setPreviewImage(image);
    };

    // Returning false prevents Ant from automatically uploading the
    // image right after the user selects an image
    return false;
  };

  const onUploadProgress = (event: ProgressEvent<EventTarget>) => {
    setUploadProgress(Math.round((event.loaded * 100) / event.total));
  };

  const imageRenderer = (originalNode: JSX.Element) => (
    <Tooltip title="Click to preview" mouseEnterDelay={0.4} mouseLeaveDelay={0}>
      {originalNode}
    </Tooltip>
  );

  const onRequestPreview = ({ thumbUrl }: UploadFile) => {
    // The browser won't properly display the image
    // in a new tab so we need to create an image with the data URI.
    // This allows us to customize how we render the image.
    if (!thumbUrl) {
      return;
    }

    const previewWindow = window.open(thumbUrl, '_blank');

    if (previewWindow === null) {
      notification.error({
        key: 'could-not-preview',
        message: 'Could not open preview',
        description:
          'The preview window could not be opened please check if pop-ups are allowed.'
      });
      return;
    }

    // Opening a new window that's on a different domain prevents
    // us from modifying that tab's title and styling so we need
    // to do that manually using document.write
    previewWindow.document.write(/* html */ `
      <title>CHDR - Preview</title>
      <style>
        body {
          margin: 0;
        }
      </style>
      <body>${previewImage.outerHTML}</body>
    `);
  };

  const uploadImage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedImage) {
      return;
    }

    loader.startLoading();

    try {
      await inventory.uploadImage({
        itemId,
        onUploadProgress,
        image: selectedImage,
        cancelToken: cancelTokenSource.token
      });
      onClose();
    } catch (err) {
      if (!(err as APIError).cancelled) {
        notification.error({
          message: 'Error Uploading Image',
          description: 'An error occurred while uploading this image, please try again'
        });
      }
    }

    // A new cancel token needs to be generated on each request
    // https://github.com/axios/axios/issues/904#issuecomment-322054741
    setCancelTokenSource(axios.CancelToken.source());

    loader.stopLoading();
  };

  const cancelUpload = () => {
    cancelTokenSource.cancel();
    notification.close(PROGRESS_NOTIFICATION_KEY);
  };

  useEffect(() => {
    if (uploadProgress === -1) {
      return;
    }

    notification.open({
      key: PROGRESS_NOTIFICATION_KEY,
      closeIcon: <div />,
      duration: 0,
      message: 'Uploading Image',
      description: (
        <Progress
          status={uploadProgress < 100 ? 'active' : 'success'}
          type="line"
          percent={uploadProgress}
        />
      )
    });

    // Delay closing the notification when the upload completes
    if (uploadProgress === 100) {
      setTimeout(() => {
        notification.close(PROGRESS_NOTIFICATION_KEY);
      }, 1000);
    }
  }, [uploadProgress]);

  return (
    <Modal
      centered
      maskClosable
      destroyOnClose
      className="image-upload-modal"
      title="Upload Image"
      visible={visible}
      onCancel={onClose}
      okText={loader.isLoading ? 'Uploading' : 'Upload'}
      cancelText={loader.isLoading ? 'Cancel' : 'Close'}
      onOk={uploadImage}
      okButtonProps={{
        disabled: selectedImage === null || loader.isLoading,
        loading: loader.isLoading
      }}
      cancelButtonProps={{
        danger: loader.isLoading,
        onClick: loader.isLoading ? cancelUpload : onClose
      }}
    >
      <form onSubmit={uploadImage}>
        <Upload.Dragger
          disabled={loader.isLoading}
          beforeUpload={onBeforeUpload}
          multiple={false}
          maxCount={1}
          onPreview={onRequestPreview}
          itemRender={imageRenderer}
          onRemove={() => setSelectedImage(null)}
          listType="picture"
          accept="image/png, image/jpeg, image/jpg"
        >
          <p className="ant-upload-frag-icon">
            <AiOutlineCloudUpload size={64} color="#525252" />
          </p>
          <p className="ant-upload-text">
            Click here or drag an image to this area to upload it.
          </p>
        </Upload.Dragger>
      </form>
    </Modal>
  );
};

export default ImageUploadModal;
