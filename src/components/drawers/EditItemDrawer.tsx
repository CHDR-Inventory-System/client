import '../../scss/edit-item-drawer.scss';
import React, { useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Divider,
  Button,
  notification,
  Drawer,
  Modal
} from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import { Item } from '../../types/API';
import useInventory from '../../hooks/inventory';
import { AtLeast } from '../../util/types';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';
import ItemImageList from '../dashboard/inventory/ItemImageList';
import useDrawer from '../../hooks/useDrawer';
import CreateReservationDrawer from './CreateReservationDrawer';

type EditItemDrawerProps = {
  visible: boolean;
  onClose: () => void;
  itemId: number;
};

const itemSchema = yup.object({
  name: yup.string().trim().required('A name is required'),
  description: yup.string().trim().optional().nullable(true),
  vendorName: yup.string().trim().optional().nullable(true),
  barcode: yup.string().trim().required('This item must have a barcode'),
  location: yup.string().trim().required('Location is required'),
  type: yup.string().trim().required('Type is required'),
  serial: yup.string().trim().optional().nullable(true),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive()
    .min(0, 'Quantity must by greater than or equal to 0')
    .integer('Quantity cannot contain decimals'),
  vendorPrice: yup
    .number()
    .min(0, 'Vendor price must by greater than or equal to 0')
    .notRequired()
    .typeError('Invalid vendor price')
    .nullable(true)
    // Because trying to parse an empty string to a number would result in an
    // error, we have to instead return null since the schema allows it
    .transform((value: string, originalValue: string) => {
      return originalValue === '' ? null : value;
    })
});

const renderDropdownWithMessage = (menuElement: React.ReactElement, message: string) => (
  <div>
    {menuElement}
    <Divider style={{ margin: '4px 0' }} />
    <p className="select-menu-details">{message}</p>
  </div>
);

const EditItemDrawer = ({
  visible,
  onClose,
  itemId
}: EditItemDrawerProps): JSX.Element | null => {
  const inventory = useInventory();
  // In this case, the parent that renders the component makes sure that the
  // id of the item is always valid so we can safely cast to Item to get
  // rid of the undefined type.
  const item = useMemo(() => inventory.getItem(itemId), [itemId]) as Item;
  const [form] = Form.useForm();
  const drawer = useDrawer({ reservation: false });
  const formik = useFormik<Item>({
    initialValues: item || ({} as Item),
    enableReinitialize: true,
    onSubmit: values => updateItem(values)
  });
  const loader = useLoader();

  const updateItem = async (values: Item) => {
    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(values).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const parsedItem = itemSchema.validateSync(values, { abortEarly: false });
      await inventory.updateItem(parsedItem as AtLeast<Item, 'ID'>);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationError = err as yup.ValidationError;

        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          validationError.inner.map(error => ({
            name: error.path || '',
            errors: [error.message]
          }))
        );
      }

      if (err instanceof APIError) {
        notification.error({
          duration: 5,
          key: 'error-updating',
          message: 'Error Updating',
          description: 'An error occurred while updating this item. Please try again.'
        });
      }

      loader.stopLoading();
      return;
    }

    notification.success({
      key: 'item-updated',
      message: 'Item Updated',
      description: `${item.name} was updated`
    });

    onClose();
    loader.stopLoading();
  };

  const deleteItem = async () => {
    loader.startLoading();

    try {
      await inventory.deleteItem(item.ID);
    } catch (err) {
      loader.stopLoading();
      notification.error({
        key: 'delete-error',
        message: 'Error Deleting Item',
        description: 'An error occurred while deleting this item, please try again.'
      });
      return;
    }

    notification.success({
      key: 'delete-success',
      message: 'Item Deleted',
      description: `${item.name} was successfully deleted.`
    });

    loader.stopLoading();
    onClose();
  };

  const handleItemRetire = async () => {
    const wasRetired = !!item.retiredDateTime;
    loader.startLoading();

    try {
      await inventory.retireItem(item.ID, wasRetired ? null : new Date());
    } catch (err) {
      loader.stopLoading();
      notification.error({
        key: 'retire-error',
        message: 'Unexpected Error',
        description: 'An error occurred while performing this action, please try again.'
      });
      return;
    }

    notification.success({
      key: 'retire-success',
      message: wasRetired ? 'Undo Retire' : 'Item Retired',
      description: wasRetired
        ? `${item.name} is no longer marked as "retired".`
        : `${item.name} is now marked as "retired"`
    });

    loader.stopLoading();
  };

  const confirmDelete = () => {
    Modal.confirm({
      centered: true,
      maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 50%)'
      },
      title: 'Delete Item',
      content: (
        <p>
          Are you sure you want to delete <b>{item.name}</b>? This action cannot be
          undone.
        </p>
      ),
      okText: 'Delete',
      okButtonProps: {
        className: 'ant-btn-dangerous'
      },
      onOk: () => deleteItem()
    });
  };

  const confirmRetire = () => {
    Modal.confirm({
      centered: true,
      maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 50%)'
      },
      title: item.retiredDateTime ? 'Undo Retire' : 'Retire Item',
      content: (
        <p>
          Are you sure you want to {item.retiredDateTime ? 'undo retiring' : 'retire'}{' '}
          <b>{item.name}</b>? Retired items cannot be checked out and will not appear in
          user searches (the item will not be deleted). This action can always be undone
          later.
        </p>
      ),
      okText: item.retiredDateTime ? 'Undo Retire' : 'Retire',
      onOk: () => handleItemRetire()
    });
  };

  useEffect(() => {
    form.setFieldsValue(item);
  }, [item]);

  return (
    <Drawer
      maskClosable
      title={`Edit - ${item.name}`}
      onClose={onClose}
      visible={visible}
      placement="right"
      className="edit-item-drawer"
      extra={
        <Button
          type="primary"
          onClick={() => formik.submitForm()}
          loading={loader.isLoading}
          disabled={loader.isLoading}
        >
          Save
        </Button>
      }
    >
      <CreateReservationDrawer
        item={item}
        visible={drawer.state.reservation}
        onClose={() => drawer.close('reservation')}
      />
      <ItemImageList itemId={item.ID} loader={loader} />
      <Form layout="vertical" form={form}>
        <Form.Item required label="Name" name="name">
          <Input type="text" onChange={formik.handleChange('name')} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea onChange={formik.handleChange('description')} />
        </Form.Item>
        <Form.Item
          required
          label="Location"
          name="location"
          help={
            !item.main
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="text"
            onChange={formik.handleChange('location')}
            disabled={!item.main}
          />
        </Form.Item>
        <Form.Item
          required
          label="Barcode"
          name="barcode"
          help={
            !item.main
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="text"
            onChange={formik.handleChange('barcode')}
            disabled={!item.main}
          />
        </Form.Item>
        <Form.Item
          required
          label="Quantity"
          name="quantity"
          help={
            !item.main
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="number"
            onChange={formik.handleChange('quantity')}
            min={0}
            disabled={!item.main}
          />
        </Form.Item>

        <Form.Item
          required
          label="Availability"
          name="available"
          help={
            !item.main
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Select
            disabled={!item.main}
            onChange={(value: boolean) => formik.setFieldValue('available', value)}
            dropdownRender={menu =>
              renderDropdownWithMessage(
                menu,
                `If an item is marked unavailable, users will not be
                able to reserve or checkout that item.`
              )
            }
          >
            <Select.Option key="available" value>
              Available
            </Select.Option>
            <Select.Option key="unavailable" value={false}>
              Unavailable
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          required
          label="Movable"
          name="moveable"
          help={
            !item.main
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Select
            disabled={!item.main}
            onChange={(value: boolean) => formik.setFieldValue('moveable', value)}
            dropdownRender={menu =>
              renderDropdownWithMessage(
                menu,
                `Can this item be moved? If it's stationary or should not leave the
                facility, this should usually be set to No.`
              )
            }
          >
            <Select.Option key="movable" value>
              Yes
            </Select.Option>
            <Select.Option key="immovable" value={false}>
              No
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Purchase Date">
          <DatePicker
            onChange={value =>
              formik.setFieldValue('purchaseDate', value?.format() || null)
            }
            defaultValue={(item.purchaseDate && moment(item.purchaseDate)) || undefined}
          />
        </Form.Item>

        <Form.Item label="Serial" name="serial">
          <Input type="text" onChange={formik.handleChange('serial')} />
        </Form.Item>

        <Form.Item required label="Type" name="type">
          <Input type="text" onChange={formik.handleChange('type')} />
        </Form.Item>

        <Form.Item label="Vendor Name" name="vendorName">
          <Input type="text" onChange={formik.handleChange('vendorName')} />
        </Form.Item>

        <Form.Item label="Vendor Price" name="vendorPrice">
          <Input
            type="number"
            onChange={formik.handleChange('vendorPrice')}
            min={0}
            prefix="$"
          />
        </Form.Item>

        <div className="form-actions">
          <Button
            danger
            className="form-action-button"
            disabled={loader.isLoading}
            onClick={confirmDelete}
          >
            Delete
          </Button>
          {item.main && (
            <Button
              type="primary"
              className="form-action-button"
              disabled={loader.isLoading}
              onClick={confirmRetire}
            >
              {item.retiredDateTime ? 'Undo Retire' : 'Retire'}
            </Button>
          )}
          <Button
            type="primary"
            className="form-action-button"
            disabled={loader.isLoading || !!item.retiredDateTime}
            onClick={() => drawer.open('reservation')}
          >
            Create Reservation
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default EditItemDrawer;
