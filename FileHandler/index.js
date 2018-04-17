/**
 * FileHandler.git
 * index
 * Created by June_z on 2018/4/15.
 * Create time 23:27
 */

window.onload = function () {
    // 获取需要的元素
    var head = document.querySelector('.head');
    var dropArea = document.querySelector('.drop-area');

    // 定义一个开关，用来绑定事件
    var flag = true;

    // 添加事件，处理上传区域的显示和隐藏
    head.onclick = function () {
        if (flag) {
            dropArea.style.display = 'block';
        } else {
            dropArea.style.display = 'none';
        }
        flag = !flag;
    }

    // 给投放区域添加投放事件
    dropArea.ondrop = function (e) {
        e.preventDefault();
        // 获取文件对象
        var fileObj = e.dataTransfer.files[0];
        // 实例化formdata对象
        var formData = new FormData();
        // 将文件对象添加到formdata中
        formData.append("upload", fileObj);
        // 实例化ajax对象
        var xhr = new XMLHttpRequest();
        // 实例化文件读取对象
        xhr.open('post', 'file.php');
        // 发送请求
        xhr.send(formData);
        // 注册ajax上传完成事件
        xhr.onreadystatechange = function (e) {
            if(xhr.readyState == '4'){
                // 当返回状态码为成功或未修改时
                if(xhr.status == '200' || xhr.status == '304'){
                    // 将显示区域隐藏
                    dropArea.style.display = 'none';
                    // 开关恢复
                    flag = true;
                    // 获取返回数据
                    var src = xhr.responseText;
                    // 创建一张图片
                    var img = document.createElement('img');
                    img.src = src;
                    head.appendChild(img);
                }
            }
        }
    }
};
