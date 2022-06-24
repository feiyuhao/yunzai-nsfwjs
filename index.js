const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const axios = require('axios');

async function ns() {
  let error1 = {
    code: 201,
    msg: '请输入网络jpg、png、gif图片'
  };
  let error2 = {
    code: 202,
    msg: '判断失败'
  };
  let fps = process.argv[3]; //每秒帧数
  if (
    process.argv[2] === null ||
    process.argv[2] === undefined ||
    process.argv[2] === ''
  ) {
    return console.log(error1);
  }
  if (
    process.argv[2].slice(0, 4) !== 'http' &&
    process.argv[2].slice(0, 5) !== 'https'
  ) {
    return console.log(error1);
  }

  let pic = await axios.get(process.argv[2], {
    responseType: 'arraybuffer'
  });
  if (!/(jpeg|jpg|png|gif)$/i.test(pic.headers['content-type'])) {
    return console.log(error1);
  }

  const model = await nsfw.load(`file://${__dirname}/jiantu/`, {
    size: 299
  }); // To load a local model, nsfw.load('file://./path/to/model/')

  if (/(jpeg|jpg|png)$/i.test(pic.headers['content-type'])) {
    // 图像必须tf.tensor3d格式
    // 您可以将图像转换为tf.tensor3d带 tf.node.decodeImage(Uint8Array,channels)
    let image = '';
    try {
      image = tf.node.decodeImage(pic.data, 3);
    } catch (err) {
      // 在这里处理错误。

      return console.log(error2);
    }

    const predictions = await model.classify(image).catch(err => {
      return console.log(error2);
    });
    image.dispose(); // 必须显式地管理张量内存(让tf.tentor超出范围才能释放其内存是不够的)。

    return console.log({
      code: 200,
      msg: predictions
    });
  } else if (/(gif)$/i.test(pic.headers['content-type'])) {
    const myConfig = {
      topk: 1, //每帧返回的结果数（默认全部为 5）
      fps: fps === undefined ? undefined : Number(fps), //每秒帧数，从中按比例选取帧（默认为所有帧）
      //   onFrame- 每帧的函数回调 - Param 是一个具有以下键/值的对象：
      // index- 当前分类的 GIF 帧（从 0 开始）
      // totalFrames- 此 GIF 的完整帧数（用于进度计算）
      // predictions- 一个长度数组，topk从分类返回顶部结果
      // image- 特定帧的图像
      onFrame: ({ index, totalFrames, predictions, image }) => {
        //   console.log({ index, totalFrames });
      }
    };

    const predictions = await model
      .classifyGif(pic.data, myConfig)
      .catch(err => {
        return console.log(error2);
      });
    return console.log({
      code: 200,
      msg: JSON.stringify(predictions)
    });
  }
}

ns();
