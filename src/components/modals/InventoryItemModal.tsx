/* eslint-disable */
import '../../scss/inventory-item-modal.scss';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Divider } from 'antd';
import { Item } from '../../types/API';
import { useFormik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';

type InventoryModalProps = {
  visible: boolean;
  onClose: () => void;
  item: Item;
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
      console.log({ originalValue, value });
      return originalValue === '' ? null : value;
    })
});

const InventoryItemModal = ({
  visible,
  onClose,
  item
}: InventoryModalProps): JSX.Element | null => {
  if (Object.keys(item).length === 0) {
    return null;
  }

  const [form] = Form.useForm();
  const formik = useFormik<Item>({
    initialValues: item,
    enableReinitialize: true,
    onSubmit: item => updateItem(item)
  });

  const updateItem = (item: Item) => {
    try {
      const parsedItem = itemSchema.validateSync(item, { abortEarly: false });
      console.log('Updated', JSON.stringify(parsedItem, null, 3));
    } catch (err) {
      const validationError = err as yup.ValidationError;

      form.setFields(
        validationError.inner.map(error => ({
          name: error.path || '',
          errors: [error.message]
        }))
      );

      return;
    }

    form.setFields(
      Object.keys(item).map(key => ({
        name: key,
        errors: []
      }))
    );
  };

  const renderDropdownWithMessage = (menu: React.ReactElement, message: string) => (
    <div>
      {menu}
      <Divider style={{ margin: '4px 0' }} />
      <p className="select-menu-details">{message}</p>
    </div>
  );

  useEffect(() => {
    form.setFieldsValue(item);
  }, [item]);

  return (
    <Modal
      className="inventory-item-modal"
      maskClosable
      destroyOnClose
      centered
      title={item.name}
      visible={visible}
      onCancel={onClose}
      onOk={() => updateItem(formik.values)}
      okText="Save"
      okButtonProps={{ htmlType: 'submit' }}
      cancelText="Close"
    >
      <Form layout="vertical" form={form}>
        <Form.Item required label="Name" name="name">
          <Input type="text" onChange={formik.handleChange('name')} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea onChange={formik.handleChange('description')} />
        </Form.Item>
        <Form.Item required label="Location" name="location">
          <Input type="text" onChange={formik.handleChange('location')} />
        </Form.Item>
        <Form.Item required label="Barcode" name="barcode">
          <Input type="text" onChange={formik.handleChange('barcode')} />
        </Form.Item>
        <Form.Item required label="Quantity" name="quantity">
          <Input type="number" onChange={formik.handleChange('quantity')} min={0} />
        </Form.Item>

        <Form.Item required label="Availability" name="available">
          <Select
            onChange={(value: boolean) => formik.setFieldValue('available', value)}
            dropdownRender={menu =>
              renderDropdownWithMessage(
                menu,
                `If an item is marked unavailable, users will not be
                able to reserve or checkout that item.`
              )
            }
          >
            <Select.Option key="available" value={true}>
              Available
            </Select.Option>
            <Select.Option key="unavailable" value={false}>
              Unavailable
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item required label="Movable" name="moveable">
          <Select
            onChange={(value: boolean) => formik.setFieldValue('moveable', value)}
            dropdownRender={menu =>
              renderDropdownWithMessage(
                menu,
                `Can this item be moved? If it's stationary or should not leave the
                facility, this should usually be set to No.`
              )
            }
          >
            <Select.Option key="movable" value={true}>
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
          <Input type="number" onChange={formik.handleChange('vendorPrice')} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InventoryItemModal;
