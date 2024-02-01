import React, { useEffect, useState } from 'react'
import {
  Form,
  Select,
  InputNumber,
  Switch,
  Radio,
  Slider,
  Button,
  Upload,
  Rate,
  Checkbox,
  Row,
  Col,
  message,
  Drawer,
  Modal,
} from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import styled from 'styled-components'
import './page2.css'
import bigImg from '../../assets/big-img.jpeg';
// import { Button as AButton, Message } from '@alifd/next';

// 测试umd二次渲染时全局变量是否丢失
window.umdGlobalKey = 'umdGlobalKey'

// window.addEventListener('click', () => {
//   console.log('测试umd懒加载页面二次渲染全局事件 - window.click')
// })

// document.addEventListener('click', () => {
//   console.log('测试umd懒加载页面二次渲染全局事件 - document.click')
// })

window.microApp?.addDataListener((data) => {
  console.log('懒加载的数据监听', data)
  return { listen: 'from page2.js' }
})

const StyledButton = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid blue;
  color: blue;
  margin: 0 1em;
  padding: 0.25em 1em;
`

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

const Page2 = () => {
  const [count, changeCount] = useState(0)
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    message.success('This is a success message');
  };

  const testClick = () => {
    console.log('click from test button')
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
  }

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log('react16 page2 useEffect')
    if (!window.umdGlobalKey) {
      throw Error('umdGlobalKey missing')
    }

    const handler = (data) => {
      console.log('懒加载组件内部的数据监听', data)
      changeCount((pre) => {
        return pre + 1
      })
    }

    window.microApp?.addDataListener(handler)

    return () => {
      window.microApp?.removeDataListener(handler)
    }
  }, [])

  return (
    <div>
      <img src={bigImg} alt="" width="100" />
      <div>接收数据次数：{count}</div>
      <div>
        <StyledButton>测试styled-components的样式</StyledButton >
        {/* <AButton type="primary" onClick={() => Message.success("success")}>Message</AButton> */}
      </div>
      <div className="test-btn" onClick={testClick}>test</div>
      <Form
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          'input-number': 3,
          'checkbox-group': ['A', 'B'],
          rate: 3.5,
        }}
      >
        <Form.Item label="Plain Text">
          <span className="ant-form-text">China</span>
        </Form.Item>
        <Form.Item
          name="select"
          label="Select"
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please select your country!',
            },
          ]}
        >
          <Select placeholder="Please select a country">
            <Option value="china">China</Option>
            <Option value="usa">U.S.A</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="select-multiple"
          label="Select[multiple]"
          rules={[
            {
              required: true,
              message: 'Please select your favourite colors!',
              type: 'array',
            },
          ]}
        >
          <Select mode="multiple" placeholder="Please select favourite colors">
            <Option value="red">Red</Option>
            <Option value="green">Green</Option>
            <Option value="blue">Blue</Option>
          </Select>
        </Form.Item>

        <Form.Item label="InputNumber">
          <Form.Item name="input-number" noStyle>
            <InputNumber min={1} max={10} />
          </Form.Item>
          <span className="ant-form-text"> machines</span>
        </Form.Item>

        <Form.Item name="switch" label="Switch" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="slider" label="Slider">
          <Slider
            marks={{
              0: 'A',
              20: 'B',
              40: 'C',
              60: 'D',
              80: 'E',
              100: 'F',
            }}
          />
        </Form.Item>

        <Form.Item name="radio-group" label="Radio.Group">
          <Radio.Group>
            <Radio value="a">item 1</Radio>
            <Radio value="b">item 2</Radio>
            <Radio value="c">item 3</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="radio-button"
          label="Radio.Button"
          rules={[
            {
              required: true,
              message: 'Please pick an item!',
            },
          ]}
        >
          <Radio.Group>
            <Radio.Button value="a">item 1</Radio.Button>
            <Radio.Button value="b">item 2</Radio.Button>
            <Radio.Button value="c">item 3</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="checkbox-group" label="Checkbox.Group">
          <Checkbox.Group>
            <Row>
              <Col span={8}>
                <Checkbox
                  value="A"
                  style={{
                    lineHeight: '32px',
                  }}
                >
                  A
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  value="B"
                  style={{
                    lineHeight: '32px',
                  }}
                  disabled
                >
                  B
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  value="C"
                  style={{
                    lineHeight: '32px',
                  }}
                >
                  C
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  value="D"
                  style={{
                    lineHeight: '32px',
                  }}
                >
                  D
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  value="E"
                  style={{
                    lineHeight: '32px',
                  }}
                >
                  E
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox
                  value="F"
                  style={{
                    lineHeight: '32px',
                  }}
                >
                  F
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="rate" label="Rate">
          <Rate />
        </Form.Item>

        <Form.Item
          name="upload"
          label="Upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="longgggggggggggggggggggggggggggggggggg"
        >
          <Upload name="logo" action="/upload.do" listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Dragger">
          <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
            <Upload.Dragger name="files" action="/upload.do">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for a single or bulk upload.</p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            span: 12,
            offset: 6,
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <div className='demo-list'>
        <div>
          <br />
          <br />
          <h1>抽屉</h1>
          <Button type="primary" onClick={showDrawer}>
            Open
          </Button>
          <Drawer
            title="Basic Drawer"
            placement="right"
            onClose={onClose}
            open={open}
            // getContainer={(target) => console.log(11111, target)}
          >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer>
        </div>
        <div>
          <br />
          <br />
          <h1>对话框</h1>
          <Button type="primary" onClick={showModal}>
            Open Modal
          </Button>
          <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Page2
