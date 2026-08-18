import { FORM_FIELD_CLASS } from "@/lib/styles";

// mood/gacha/provider/genre/awardsの各ページには「ラベル+<select>+<option>一覧」という
// 全く同じ形のフォーム部品が何度も出てくる(ジャンル選択、気分選択、並び替え選択…)。
// このコンポーネントに切り出しておくことで、各ページ側は「どんな選択肢を渡すか」だけを
// 書けばよくなり、<select>のTailwindクラスや<option>のmap処理を毎回書かなくて済む。

export interface SelectOption {
  value: string;
  label: string;
}

// awardsページの「アカデミー賞 > 作品賞/監督賞」のような、選択肢をグループ分けしたい場合に使う。
export interface SelectOptionGroup {
  groupLabel: string;
  options: SelectOption[];
}

interface FormSelectProps {
  label: string; // <select>の上に表示するラベル文字列
  name: string; // フォーム送信時のキー名(?name=valueのname部分)
  defaultValue: string; // 現在選ばれている値(URLのクエリパラメータから復元する)
  // 通常はoptionsだけ渡せばよい。awardsページのように<optgroup>で
  // グループ分けしたい時だけgroupsを渡す(optionsとgroupsは同時に指定しない想定)。
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  // 一覧の先頭に「指定なし」「おすすめ」のような案内用の選択肢を出したい時に渡す。
  // requiredがtrueの時は、この選択肢自体を選べないようにする(disabled)。
  placeholder?: string;
  required?: boolean;
}

export default function FormSelect({
  label,
  name,
  defaultValue,
  options,
  groups,
  placeholder,
  required,
}: FormSelectProps) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={FORM_FIELD_CLASS}
      >
        {placeholder !== undefined && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {/* optionsが渡された場合(ほとんどのページ)は、選択肢をそのまま並べる */}
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {/* groupsが渡された場合(awardsページ)は、<optgroup>でグループ分けして表示する */}
        {groups?.map((g) => (
          <optgroup key={g.groupLabel} label={g.groupLabel}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
