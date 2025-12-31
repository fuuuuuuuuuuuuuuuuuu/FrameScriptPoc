import { Clip, ClipSequence } from "../src/lib/clip"
import { seconds } from "../src/lib/frame"
import { Project, type ProjectSettings } from "../src/lib/project"
import { TimeLine } from "../src/lib/timeline"
import { Video, video_length } from "../src/lib/video/video"
import { Voice, Ruby } from "../src/lib/voice"

export const PROJECT_SETTINGS: ProjectSettings = {
  name: "framescript-template",
  width: 1920,
  height: 1080,
  fps: 60,
}

const PlayClip = () => {
  const video = "project/videos/2025-12-31 16-23-33.mkv"
  return (
    <Clip label="プレイ" duration={video_length(video)}>
      <Video video={video} />
    </Clip>
  )
}

const VoiceTrack = () => {
  const defaultParams = { speed: 1.2 }
  return (
    <ClipSequence>
      <Clip label="voice1">
        <Voice params={defaultParams}>対戦よろしくお願いします</Voice>
      </Clip>
      <Clip label="pause1" duration={seconds(2)} />
      <Clip label="voice2">
        <Voice params={defaultParams}>こちらは名推理イシド、お相手はデモンスミス</Voice>
      </Clip>
      <Clip label="pause2" duration={seconds(1)} />
      <Clip label="voice3">
        <Voice params={defaultParams}>こちらの先行</Voice>
      </Clip>
      <Clip label="pause3" duration={seconds(1)} />
      <Clip label="voice4">
        <Voice params={defaultParams}>スタンバイフェイズにプルリアをうたれたが特に問題なし</Voice>
      </Clip>
      <Clip label="pause4" duration={seconds(1)} />
      <Clip label="voice5">
        <Voice params={defaultParams}><Ruby reading="てふだ">手札</Ruby>からラドリーを召喚</Voice>
      </Clip>
      <Clip label="voice6">
        <Voice params={defaultParams}>召喚時効果で3枚墓地送り、マーレラいいね</Voice>
      </Clip>
      <Clip label="voice7">
        <Voice params={defaultParams}>アヌビス効果で刻印を持つものをサーチ</Voice>
      </Clip>
      <Clip label="voice8">
        <Voice params={defaultParams}>最後にバージェストマ二種を伏せてターン終了</Voice>
      </Clip>
      <Clip label="voice9">
        <Voice params={defaultParams}>お相手のターン</Voice>
      </Clip>
      <Clip label="pause5" duration={seconds(1)} />
      <Clip label="voice10">
        <Voice params={defaultParams}>クォーツ効果でフュージョンサーチ、そのまま発動</Voice>
      </Clip>
      <Clip label="pause6" duration={seconds(3.5)} />
      <Clip label="voice11">
        <Voice params={defaultParams}>これはディノミスクスで除外</Voice>
      </Clip>
      <Clip label="pause7" duration={seconds(1.5)} />
      <Clip label="voice12">
        <Voice params={defaultParams}>チェーンしてマーレラ召喚</Voice>
      </Clip>
      <Clip label="pause8" duration={seconds(8.5)} />
      <Clip label="voice13">
        <Voice params={defaultParams}>お相手のネピリム召喚にチェーンしてマーレラ</Voice>
      </Clip>
      <Clip label="pause9" duration={seconds(1.5)} />
      <Clip label="voice14">
        <Voice params={defaultParams}>それにチェーンしてディノミスクス召喚</Voice>
      </Clip>
      <Clip label="pause10" duration={seconds(5)} />
      <Clip label="voice15">
        <Voice params={defaultParams}>墓地に落とすのは次元障壁</Voice>
      </Clip>
      <Clip label="pause11" duration={seconds(5.5)} />
      <Clip label="voice16">
        <Voice params={defaultParams}>ロールバック発動、次元障壁で融合モンスターの効果を無効に</Voice>
      </Clip>
      <Clip label="pause12" duration={seconds(0.5)} />
      <Clip label="voice17">
        <Voice params={defaultParams}>お相手、それにチェーンしてヴォイドからの<Ruby reading="りんくしょうかん">L召喚</Ruby>でファントム</Voice>
      </Clip>
      <Clip label="pause13" duration={seconds(5.5)} />
      <Clip label="voice18">
        <Voice params={defaultParams}><Ruby reading="りんくしょうかん">L召喚</Ruby>時効果でディスパージをサーチして発動、クォーツサーチ</Voice>
      </Clip>
      <Clip label="pause14" duration={seconds(6)} />
      <Clip label="voice19">
        <Voice params={defaultParams}>ファントムでマーレラ破壊してターンエンド</Voice>
      </Clip>
      <Clip label="pause15" duration={seconds(2)} />
      <Clip label="voice20">
        <Voice params={defaultParams}>こちらのターン</Voice>
      </Clip>
      <Clip label="pause16" duration={seconds(4.5)} />
      <Clip label="voice21">
        <Voice params={defaultParams}>マーレラとラドリーで<Ruby reading="えくしーずしょうかん">X召喚</Ruby>、オパビニア</Voice>
      </Clip>
      <Clip label="pause17" duration={seconds(3)} />
      <Clip label="voice22">
        <Voice params={defaultParams}>オパビニア効果でレアンコイリアをサーチ</Voice>
      </Clip>
      <Clip label="pause18" duration={seconds(0.5)} />
      <Clip label="voice23">
        <Voice params={defaultParams}><Ruby reading="てふだ">手札</Ruby>からマーレラ、それにチェーンして墓地のマーレラ</Voice>
      </Clip>
      <Clip label="pause19" duration={seconds(3)} />
      <Clip label="voice24">
        <Voice params={defaultParams}>マーレラを特殊召喚</Voice>
      </Clip>
      <Clip label="pause20" duration={seconds(2)} />
      <Clip label="voice25">
        <Voice params={defaultParams}>墓地に落とすのはトラップトリック</Voice>
      </Clip>
      <Clip label="pause21" duration={seconds(0.5)} />
      <Clip label="voice26">
        <Voice params={defaultParams}>からのレアンコイリア、チェーンでマーレラ</Voice>
      </Clip>
      <Clip label="pause22" duration={seconds(2)} />
      <Clip label="voice27">
        <Voice params={defaultParams}>マーレラを特殊召喚してロールバックを墓地に戻す</Voice>
      </Clip>
      <Clip label="pause23" duration={seconds(4)} />
      <Clip label="voice28">
        <Voice params={defaultParams}>刻印を持つものを召喚、聖域サーチ</Voice>
      </Clip>
      <Clip label="pause24" duration={seconds(0.5)} />
      <Clip label="voice29">
        <Voice params={defaultParams}>そして発動、アポピスの邪神をセット</Voice>
      </Clip>
      <Clip label="pause25" duration={seconds(0.5)} />
      <Clip label="voice30">
        <Voice params={defaultParams}>からのアヌビスをサーチ</Voice>
      </Clip>
      <Clip label="pause26" duration={seconds(2.5)} />
      <Clip label="voice31">
        <Voice params={defaultParams}>オパビニアとディノミスクスで<Ruby reading="りんくしょうかん">L召喚</Ruby>、カンブリラスター</Voice>
      </Clip>
      <Clip label="pause27" duration={seconds(4)} />
      <Clip label="voice32">
        <Voice params={defaultParams}>邪神を墓地に送りレアンコイリアをセット</Voice>
      </Clip>
      <Clip label="pause28" duration={seconds(1)} />
      <Clip label="voice33">
        <Voice params={defaultParams}>そして発動、マーレラを墓地にもどし、チェインしてレアンコイリア召喚</Voice>
      </Clip>
      <Clip label="pause29" duration={seconds(8)} />
      <Clip label="voice34">
        <Voice params={defaultParams}>ロールバック発動、トラップトリックで<Ruby reading="はりむし">針虫</Ruby>をセットし発動</Voice>
      </Clip>
      <Clip label="pause30" duration={seconds(4)} />
      <Clip label="voice35">
        <Voice params={defaultParams}>それにチェーンしてマーレラ召喚</Voice>
      </Clip>
      <Clip label="pause31" duration={seconds(6)} />
      <Clip label="voice36">
        <Voice params={defaultParams}>マーレラとレアンコイリアでオパビニア</Voice>
      </Clip>
      <Clip label="pause32" duration={seconds(5)} />
      <Clip label="voice37">
        <Voice params={defaultParams}>マーレラとカンブリラスターで<Ruby reading="ぎがんてぃっくすぷらいと">ギガンティック・スプライト</Ruby></Voice>
      </Clip>
      <Clip label="pause33" duration={seconds(6)} />
      <Clip label="voice38">
        <Voice params={defaultParams}>墓地罠2枚戻してアヌビス</Voice>
      </Clip>
      <Clip label="pause34" duration={seconds(2)} />
      <Clip label="voice39">
        <Voice params={defaultParams}><Ruby reading="ぎがんてぃっくすぷらいと">ギガンティック・スプライト</Ruby>とオパビニアで<Ruby reading="ほーぷぜある">ホープ・ゼアル</Ruby></Voice>
      </Clip>
      <Clip label="pause35" duration={seconds(5)} />
      <Clip label="voice40">
        <Voice params={defaultParams}>墓地罠2枚戻してアヌビス、からのスペリオル</Voice>
      </Clip>
      <Clip label="pause36" duration={seconds(5)} />
      <Clip label="voice41">
        <Voice params={defaultParams}>効果でアヌビスを墓地に、からの墓地罠2枚戻してアヌビス×2</Voice>
      </Clip>
      <Clip label="pause37" duration={seconds(4)} />
      <Clip label="voice42">
        <Voice params={defaultParams}>アヌビス2体でヴァルドラス</Voice>
      </Clip>
      <Clip label="pause38" duration={seconds(7)} />
      <Clip label="voice43">
        <Voice params={defaultParams}>バトルフェイズ、攻撃が10500になったゼアルで攻撃</Voice>
      </Clip>
      <Clip label="pause39" duration={seconds(4)} />
      <Clip label="voice44">
        <Voice params={defaultParams}>対戦ありがとうございました</Voice>
      </Clip>
    </ClipSequence>
  )
}

export const PROJECT = () => {
  return (
    <Project>
      <TimeLine>
        <PlayClip />
        <VoiceTrack />
      </TimeLine>
    </Project>
  )
}
