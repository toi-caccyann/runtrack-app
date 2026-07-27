const nicknameInput = document.getElementById('nickname-input');
const genderInput = document.getElementById('gender-input');
const ageInput = document.getElementById('age-input');
const heightInput = document.getElementById('height-input');
const weightInput = document.getElementById('weight-input');
const saveProfileBtn = document.getElementById('save-profile-btn');

//画面が開いた時に、すでに保存されたプロフィールがあれば自動で表示する
window.addEventListener('DOMContentLoaded' ,() => {
  const savedProfile = JSON.parse(localStorage.getItem('userProfile'));


  //もし過去に保存したデータがあれば、入力欄に初期値として入れる
  if(savedProfile) {
    nicknameInput.value = savedProfile.nickname || '' ;
    genderInput.value = savedProfile.gender || '';
    ageInput.value = savedProfile.age || '';
    heightInput.value = savedProfile.height || '';
    weightInput.value = savedProfile.weight || '';

  };

});

//「プロフィールを保存」ボタンが押されたときの処理
saveProfileBtn.addEventListener('click', () => {
  // 入力された値を取得する
    const nickname = nicknameInput.value;
    const gender = genderInput.value;
    const age = parseInt(ageInput.value); // 整数に変換
    const height = parseFloat(heightInput.value); // 小数に対応
    const weight = parseFloat(weightInput.value); // 小数に対応

    // ニックネームや体重が空っぽの場合の簡単なチェック
    if (!nickname || isNaN(weight)) {
        showToast('ニックネームと体重は必ず入力してください！');
        return;
    };

//保存するためのオブジェクトを作る（age/heightは未入力可のためNaNならnullにしておく）
  const userProfile = {
    nickname: nickname,
    gender: gender,
    age: isNaN(age) ? null : age,
    height: isNaN(height) ? null : height,
    weight: weight
  };

//ローカルストレージに 'userProfile' という名前で保存する
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

//ユーザーに保存できたことを知らせる
    showToast('プロフィールを保存しました！');

  });