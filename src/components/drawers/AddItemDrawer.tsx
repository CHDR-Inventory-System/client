import '../../scss/add-item-drawer.scss';
import React, { useEffect } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Divider,
  notification
} from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Item } from '../../types/API';
import useLoader from '../../hooks/loading';
import APIError from '../../util/APIError';
import useInventory from '../../hooks/inventory';

type AddItemDrawerProps = {
  visible: boolean;
  onClose: () => void;
  parentItem?: Item;
};

const itemSchema = yup.object({
  name: yup.string().trim().required('A name is required'),
  description: yup.string().trim().optional().nullable(true),
  vendorName: yup.string().trim().optional().nullable(true),
  barcode: yup.string().trim().required('This item must have a barcode'),
  location: yup.string().trim().required('Location is required'),
  type: yup.string().trim().required('Type is required'),
  serial: yup.string().trim().optional().nullable(true),
  available: yup.boolean().required('Availability is required'),
  moveable: yup.boolean().required('Movability is required'),
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

const AddItemDrawer = ({
  onClose,
  visible,
  parentItem
}: AddItemDrawerProps): JSX.Element => {
  const [form] = Form.useForm();
  const formik = useFormik<Partial<Item>>({
    initialValues: {
      location: parentItem?.location,
      barcode: parentItem?.barcode,
      quantity: parentItem?.quantity,
      available: parentItem?.available,
      moveable: parentItem?.moveable
    },
    enableReinitialize: true,
    onSubmit: values => addItem(values)
  });
  const loader = useLoader();
  const inventory = useInventory();

  const renderDropdownWithMessage = (menu: React.ReactElement, message: string) => (
    <div>
      {menu}
      <Divider style={{ margin: '4px 0' }} />
      <p className="select-menu-details">{message}</p>
    </div>
  );

  const addItem = async (item: Partial<Item>) => {
    loader.startLoading();

    // Reset all errors in the form
    form.setFields(
      Object.keys(item).map(key => ({
        name: key,
        errors: []
      }))
    );

    try {
      const parsedItem = await itemSchema.validate(item, { abortEarly: false });

      if (parentItem) {
        await inventory.addChildItem(parentItem.ID, parentItem.item, parsedItem);
      } else {
        await inventory.addItem(parsedItem);
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Because errors are handled by Formik, we need to make sure Ant's form
        // knows about Formik's errors
        form.setFields(
          err.inner.map(error => ({
            name: error.path || '',
            errors: [error.message]
          }))
        );
      }

      if (err instanceof APIError) {
        notification.error({
          duration: 5,
          key: 'error-adding',
          message: 'Error Adding',
          description: 'An error occurred while adding this item. Please try again.'
        });
      }

      loader.stopLoading();
      return;
    }

    loader.stopLoading();

    notification.success({
      key: 'item-added',
      message: 'New Item Added',
      description: `${item.name} was added to inventory.`
    });

    onClose();
  };

  useEffect(() => {
    form.resetFields();

    if (parentItem) {
      form.setFieldsValue({
        location: parentItem.location,
        barcode: parentItem.barcode,
        quantity: parentItem.quantity,
        available: parentItem.available,
        moveable: parentItem.moveable
      });
    }
  }, [parentItem]);

  return (
    <Drawer
      title={parentItem ? 'Add Child Item' : 'Add Item'}
      className="add-item-drawer"
      maskClosable
      destroyOnClose
      visible={visible}
      onClose={onClose}
      placement="right"
      extra={
        <Button
          type="primary"
          loading={loader.isLoading}
          disabled={loader.isLoading}
          onClick={() => formik.submitForm()}
        >
          Save
        </Button>
      }
    >
      <div className="drawer-header-message">
        {!!parentItem && (
          <p>
            This will add a child item to the parent: <span>{parentItem.name}</span>
          </p>
        )}
        <p>You will be able to upload images after this item is created.</p>
      </div>
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
            parentItem
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="text"
            onChange={formik.handleChange('location')}
            disabled={!!parentItem}
          />
        </Form.Item>
        <Form.Item
          required
          label="Barcode"
          name="barcode"
          help={
            parentItem
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="text"
            onChange={formik.handleChange('barcode')}
            disabled={!!parentItem}
          />
        </Form.Item>
        <Form.Item
          required
          label="Quantity"
          name="quantity"
          help={
            parentItem
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Input
            type="number"
            onChange={formik.handleChange('quantity')}
            min={0}
            disabled={!!parentItem}
          />
        </Form.Item>

        <Form.Item
          required
          label="Availability"
          name="available"
          help={
            parentItem
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Select
            disabled={!!parentItem}
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
            parentItem
              ? 'This value can only be updated through the parent item.'
              : undefined
          }
        >
          <Select
            disabled={!!parentItem}
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
      </Form>
    </Drawer>
  );
};

export default AddItemDrawer;
