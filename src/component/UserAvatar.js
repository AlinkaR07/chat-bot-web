import React, { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';

import './css/UserAvatar.css'

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UserAvatar = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([ ]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList( newFileList );
    console.log(newFileList[0]);
  }

  const uploadButton = (
    <div>
        <button className="upload-button" type="button" >
            <UserOutlined style={{ color: "#ffffff"}}/>
            <div className="upload-text"> Загрузить</div>
        </button>
    </div>
  );
  
  return (
    <>
        <ImgCrop rotationSlider>
            <Upload
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
            >
                {fileList.length >=1 ? null : uploadButton}
            </Upload>
        </ImgCrop>
        <Modal open={previewOpen} title={"Ваше фото"} footer={null} onCancel={handleCancel}>
            <img alt="example" style={{ width: '100%'}} src={previewImage} />
        </Modal>
    </>
  );
};
export default UserAvatar;