import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BaseModule } from 'src/module/base';
import { DatabaseService } from 'src/module/base/database';

@Module({
  imports: [BaseModule],
})
class DataIntegrityScript {
  constructor(private readonly databaseService: DatabaseService) {
    // this.identifyResolutionMapping()
    // this.ensureCompany().then((r) => {
    //   console.log(r);
    // });
    // this.addAvatarForCompany().then((r) => console.log(r));
    // this.identifyResolutionStatus();
  }

  async addPhrase() {
    const phrases = [
      'người trung thực',
      'nói tiếng Anh rất trôi chảy',
      'khá là béo so với tuổi',
      'Cái tủ lạnh ở dưới nhà',
      'những ngày thứ 6 lúc 5h chiều',
      'Con gái luôn ăn ít',
      'Nó đẹp, tiện nghi và rất ấm cúng',
      'Đó là một công việc tốt',
      'thường bay đi Tokyo',
      'làm thư ký ở một văn phòng nhỏ',
      'hơi đắt',
      'ghét 2 bức tranh này',
      'Về bản chất',
      'Nhà hàng này có dịch vụ tuyệt vời',
      'chìa khoá bước ra thế giới',
      'ăn sáng',
      'luôn tử tế với tôi',
      'Cô ấy tuyệt đẹp',
      'bỏ đồ vật vào miệng',
      'nuốt cả đồ vật',
      'đặt vào trong rổ',
      'cái hộp gỗ này',
      'Trên khay có một cái đĩa',
      'một vài cái bát',
      'Mọi người ở đây tử tế với tôi',
      'Jane là một bé gái',
      'Cô bé trồng hoa',
      'Con chó nằm dưới ghế bành',
      'Tôi cần gạo, đậu, xà lách và đường',
      'Đi vào phòng anh và ở đó',
      'vào những ngày cuối tuần',
      'mang con tới công viên vào những ngày chủ nhật',
      'Tôi rất hay gặp cô ấy để uống cà phê',
      'Tôi thi thoảng gặp rắc rối',
      'đang gặp rắc rối',
      'có vài cái bánh ở trên bàn',
      'Đi lau sàn nhà đi',
      'Có ai đó ở ngoài cửa',
      'Lan vừa lười lại vừa đãng trí',
      'Anh sẽ đưa em đi làm nếu em muốn',
      'Chúng ta rất có thể phải đợi ở đây lâu',
      'Giờ này tuần sau tôi ở Paris',
      'Cả hai chị em đều giỏi tiếng Anh',
      'Mai e nhất định không đi muộn – Em hứa',
      'Ngày nay không biết tiếng Anh thì dở quá',
      'Thôi được, tôi sẽ đến tầm khoảng 7 giờ ',
      'Người Việt Nam hay uống trà',
      'Bố hoặc mẹ sẽ đến đón em',
      'không biện hộ/lý lẽ gì hết đối với việc dùng ngôn ngữ bậy bạ trên tivi. Điều đó không thể chấp nhận được',
      'Tôi nói tiếng Việt không giỏi lắm',
      'Anh sẽ đón em lúc 7 giờ, nếu không thì sẽ 6 giờ',
      'Tôi không có con trai, tôi chỉ có mỗi đứa con gái',
      'Này, cái hộp chẳng chịu mở ra gì cả',
      'Tôi sẽ đi gọi xe cứu thương',
      'Không có cây cầu nào bắc qua sông',
      'Người già thường hay đãng trí',
      'Quần áo ở cửa hàng này không quá đắt',
      'Tôi chả biết gì về đời tư cô ta cả',
      'Không ai muốn nghèo cả',
      'Tôi tin là mình học được tiếng anh trong một thời gian tương đối ngắn',
      'Tôi rất thích việc làm của mình vì nó vừa hữu ích vừa thú vị',
      'Có vợ đẹp chưa chắc đã là điều hay',
      'Họ giàu, đúng thế. Nhưng điều đó không nhất thiết có nghĩa là họ sung sướng',
      'Đừng tưởng tôi không hiểu anh',
      'Anh ta lúc ở Hà Nội lúc ở Sài Gòn',
      'Tôi cho rằng anh ta không quá thông minh',
      'Trên mặt trăng không có nước',
      'Người thông minh không kiêu căng',
      'Cô ta không những chỉ hát mà còn chơi cả dương cầm nữa',
      'Không thể băng qua sông',
      'Chẳng ai thích Tom lắm bởi vì anh ta quá phiền phức',
    ];
    for (const phrase of phrases) {
      await this.databaseService.phrase.create({
        data: {
          content: phrase,
          language: 'Vietnamese',
        },
      });
      console.log(`Added phrase: ${phrase}`);
    }
  }
}

(async function start() {
  const app = await NestFactory.createApplicationContext(DataIntegrityScript);
  const script = app.get(DataIntegrityScript);
  await script.addPhrase();
  return app.close();
})();
