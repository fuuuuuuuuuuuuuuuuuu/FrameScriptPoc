import type { ComponentProps } from "react"
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

// プロジェクト用Voiceラッパー（デフォルト設定を適用）
const V = (props: ComponentProps<typeof Voice>) => (
  <Voice
    speakerId={108} // 東北きりたん
    params={{ speed: 1.2 }}
    {...props}
  />
)

const PlayClip = () => {
  const video = "project/videos/2025-12-31 16-23-33.mkv"
  return (
    <Clip label="プレイ" duration={video_length(video)}>
      <Video video={video} />
    </Clip>
  )
}

const VoiceTrack = () => {
  return (
    <ClipSequence>
      <Clip label="voice1">
        <V>対戦よろしくお願いします</V>
      </Clip>
      <Clip label="pause1" duration={seconds(2)} />
      <Clip label="voice2">
        <V>こちらは名推理イシド、お相手はデモンスミス</V>
      </Clip>
      <Clip label="pause2" duration={seconds(1)} />
      <Clip label="voice3">
        <V>こちらの先行</V>
      </Clip>
      <Clip label="pause3" duration={seconds(1)} />
      <Clip label="voice4">
        <V>スタンバイフェイズにプルリアをうたれたが特に問題なし</V>
      </Clip>
      <Clip label="pause4" duration={seconds(1)} />
      <Clip label="voice5">
        <V><Ruby reading="てふだ">手札</Ruby>からラドリーを召喚</V>
      </Clip>
      <Clip label="voice6">
        <V>召喚時効果で3枚墓地送り、マーレラいいね</V>
      </Clip>
      <Clip label="voice7">
        <V>アヌビス効果で刻印を持つものをサーチ</V>
      </Clip>
      <Clip label="pause4" duration={seconds(1)} />
      <Clip label="voice8">
        <V>最後にバージェストマ二種を伏せてターン終了</V>
      </Clip>
      <Clip label="pause4" duration={seconds(1)} />
      <Clip label="voice9">
        <V>お相手のターン</V>
      </Clip>
      <Clip label="pause4" duration={seconds(3)} />
      <Clip label="pause5" duration={seconds(1)} />
      <Clip label="voice10">
        <V>クォーツ効果でフュージョンサーチ、そのまま発動</V>
      </Clip>
      <Clip label="pause6" duration={seconds(3.5)} />
      <Clip label="voice11">
        <V>これはディノミスクスで除外</V>
      </Clip>
      <Clip label="pause7" duration={seconds(1.5)} />
      <Clip label="voice12">
        <V>チェーンしてマーレラ召喚</V>
      </Clip>
      <Clip label="pause8" duration={seconds(8.5)} />
      <Clip label="voice13">
        <V>お相手のネピリム召喚にチェーンしてマーレラ</V>
      </Clip>
      <Clip label="pause9" duration={seconds(1.5)} />
      <Clip label="voice14">
        <V>それにチェーンしてディノミスクス召喚</V>
      </Clip>
      <Clip label="pause10" duration={seconds(5)} />
      <Clip label="voice15">
        <V>墓地に落とすのは次元障壁</V>
      </Clip>
      <Clip label="pause11" duration={seconds(5.5)} />
      <Clip label="voice16">
        <V>ロールバック発動、次元障壁で融合モンスターの効果を無効に</V>
      </Clip>
      <Clip label="pause12" duration={seconds(0.5)} />
      <Clip label="voice17">
        <V>お相手、それにチェーンしてヴォイドからの<Ruby reading="りんくしょうかん">L召喚</Ruby>でファントム</V>
      </Clip>
      <Clip label="pause13" duration={seconds(5.5)} />
      <Clip label="voice18">
        <V><Ruby reading="りんくしょうかん">L召喚</Ruby>時効果でディスパージをサーチして発動、クォーツサーチ</V>
      </Clip>
      <Clip label="pause14" duration={seconds(7)} />
      <Clip label="voice19">
        <V>ファントムでマーレラ破壊してターンエンド</V>
      </Clip>
      <Clip label="pause15" duration={seconds(4)} />
      <Clip label="voice20">
        <V>こちらのターン</V>
      </Clip>
      <Clip label="pause16" duration={seconds(4.5)} />
      <Clip label="voice21">
        <V>マーレラとラドリーで<Ruby reading="えくしーずしょうかん">X召喚</Ruby>、オパビニア</V>
      </Clip>
      <Clip label="pause17" duration={seconds(3)} />
      <Clip label="voice22">
        <V>オパビニア効果でレアンコイリアをサーチ</V>
      </Clip>
      <Clip label="pause18" duration={seconds(2)} />
      <Clip label="voice23">
        <V><Ruby reading="てふだ">手札</Ruby>からマーレラ、それにチェーンして墓地のマーレラ</V>
      </Clip>
      <Clip label="pause19" duration={seconds(3)} />
      <Clip label="voice24">
        <V>マーレラを特殊召喚</V>
      </Clip>
      <Clip label="pause20" duration={seconds(2)} />
      <Clip label="voice25">
        <V>墓地に落とすのはトラップトリック</V>
      </Clip>
      <Clip label="pause21" duration={seconds(0.5)} />
      <Clip label="voice26">
        <V>からのレアンコイリア、チェーンでマーレラ</V>
      </Clip>
      <Clip label="pause22" duration={seconds(2)} />
      <Clip label="voice27">
        <V>マーレラを特殊召喚してロールバックを墓地に戻す</V>
      </Clip>
      <Clip label="pause23" duration={seconds(4)} />
      <Clip label="voice28">
        <V>刻印を持つものを召喚、聖域サーチ</V>
      </Clip>
      <Clip label="pause24" duration={seconds(0.5)} />
      <Clip label="voice29">
        <V>そして発動、アポピスの邪神をセット</V>
      </Clip>
      <Clip label="pause25" duration={seconds(0.5)} />
      <Clip label="voice30">
        <V>からのアヌビスをサーチ</V>
      </Clip>
      <Clip label="pause26" duration={seconds(2.5)} />
      <Clip label="voice31">
        <V>オパビニアとディノミスクスで<Ruby reading="りんくしょうかん">L召喚</Ruby>、カンブリラスター</V>
      </Clip>
      <Clip label="pause27" duration={seconds(5)} />
      <Clip label="voice32">
        <V>邪神を墓地に送りレアンコイリアをセット</V>
      </Clip>
      <Clip label="pause28" duration={seconds(1)} />
      <Clip label="voice33">
        <V>そして発動、マーレラを墓地にもどし、チェインしてレアンコイリア召喚</V>
      </Clip>
      <Clip label="pause29" duration={seconds(10)} />
      <Clip label="voice34">
        <V>ロールバック発動、トラップトリックで<Ruby reading="はりむし">針虫</Ruby>をセットし発動</V>
      </Clip>
      <Clip label="pause30" duration={seconds(4)} />
      <Clip label="voice35">
        <V>それにチェーンしてマーレラ召喚</V>
      </Clip>
      <Clip label="pause31" duration={seconds(6)} />
      <Clip label="voice36">
        <V>マーレラとレアンコイリアでオパビニア</V>
      </Clip>
      <Clip label="pause32" duration={seconds(7)} />
      <Clip label="voice37">
        <V>マーレラとカンブリラスターで<Ruby reading="ぎがんてぃっくすぷらいと">ギガンティック・スプライト</Ruby></V>
      </Clip>
      <Clip label="pause33" duration={seconds(6)} />
      <Clip label="voice38">
        <V>墓地罠2枚戻してアヌビス</V>
      </Clip>
      <Clip label="pause34" duration={seconds(2)} />
      <Clip label="voice39">
        <V><Ruby reading="ぎがんてぃっくすぷらいと">ギガンティック・スプライト</Ruby>とオパビニアで<Ruby reading="ほーぷぜある">ホープ・ゼアル</Ruby></V>
      </Clip>
      <Clip label="pause35" duration={seconds(5)} />
      <Clip label="voice40">
        <V>墓地罠2枚戻してアヌビス、からのスペリオル</V>
      </Clip>
      <Clip label="pause36" duration={seconds(5)} />
      <Clip label="voice41">
        <V>効果でアヌビスを墓地に、からの墓地罠2枚戻してアヌビス×2</V>
      </Clip>
      <Clip label="pause37" duration={seconds(4)} />
      <Clip label="voice42">
        <V>アヌビス2体でヴァルドラス</V>
      </Clip>
      <Clip label="pause38" duration={seconds(9)} />
      <Clip label="voice43">
        <V>バトルフェイズ、攻撃が10500になったゼアルで攻撃</V>
      </Clip>
      <Clip label="pause39" duration={seconds(4)} />
      <Clip label="voice44">
        <V>対戦ありがとうございました</V>
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
