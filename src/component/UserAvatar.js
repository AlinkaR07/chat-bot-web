import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Space, Upload } from 'antd';

const UserAvatar = () => (
  <Space
    direction="vertical"
    style={{
      width: '10vw',
      height: '10vh',
    }}
  >
    <Upload
      action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
      listType="picture"
      maxCount={1}
      className="custom-upload"
    >
      <Button icon={<UploadOutlined />}>Загрузить фото</Button>
    </Upload>
  </Space>
);
export default UserAvatar;