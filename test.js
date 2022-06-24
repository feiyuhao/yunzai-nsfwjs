// 本地测试文件
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const fs = require('fs');

async function ns() {
  let error1 = {
    code: 201,
    msg: '请输入jpg或png图片'
  };
  let error2 = {
    code: 202,
    msg: '判断失败'
  };
  let fps = process.argv[3];
  if (
    process.argv[2] === null ||
    process.argv[2] === undefined ||
    process.argv[2] === ''
  ) {
    return console.log(error1);
  }
  let pic = {};
  //   console.log(process.argv[2]);
  pic.data = fs.readFileSync(process.argv[2]);
  //   console.log(pic);
  const model = await nsfw.load(`file://${__dirname}/jiantu/`, {
    size: 299
  }); // To load a local model, nsfw.load('file://./path/to/model/')
  // 图像必须tf.tensor3d格式
  // 您可以将图像转换为tf.tensor3d带 tf.node.decodeImage(Uint8Array,channels)
  //   const image = await tf.node.decodeImage(pic.data, 3);
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

  const predictions = await model.classifyGif(pic.data, myConfig);
  //   image.dispose(); // 必须显式地管理张量内存(让tf.tentor超出范围才能释放其内存是不够的)。
  console.log(predictions);
}

ns();
