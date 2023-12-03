<script lang="ts">
  import arrowDown from "../assets/icons/arrow-down.svg?raw";
  import arrowUp from "../assets/icons/arrow-up.svg?raw";
  import copy from "../assets/icons/copy.svg?raw";
  import cropRotateTl from "../assets/icons/crop-rotate-tl.svg?raw";
  import cut from "../assets/icons/cut.svg?raw";
  import deleteCircle from "../assets/icons/delete-circle.svg?raw";
  import diceFive from "../assets/icons/dice-five.svg?raw";
  import door from "../assets/icons/door.svg?raw";
  import download from "../assets/icons/download.svg?raw";
  import drag from "../assets/icons/drag.svg?raw";
  import editPencil from "../assets/icons/edit-pencil.svg?raw";
  import emptyPage from "../assets/icons/empty-page.svg?raw";
  import erase from "../assets/icons/erase.svg?raw";
  import eyeEmpty from "../assets/icons/eye-empty.svg?raw";
  import eyeOff from "../assets/icons/eye-off.svg?raw";
  import fillColor from "../assets/icons/fill-color.svg?raw";
  import flipHoriz from "../assets/icons/flip-horiz.svg?raw";
  import flipVert from "../assets/icons/flip-vert.svg?raw";
  import gitMerge from "../assets/icons/git-merge.svg?raw";
  import hexagonDice from "../assets/icons/hexagon-dice.svg?raw";
  import magicWand from "../assets/icons/magic-wand.svg?raw";
  import minus from "../assets/icons/minus.svg?raw";
  import openSelectHandGesture from "../assets/icons/open-select-hand-gesture.svg?raw";
  import pasteClipboard from "../assets/icons/paste-clipboard.svg?raw";
  import plus from "../assets/icons/plus.svg?raw";
  import redo from "../assets/icons/redo.svg?raw";
  import refresh from "../assets/icons/refresh.svg?raw";
  import saveFloppyDisk from "../assets/icons/save-floppy-disk.svg?raw";
  import settings from "../assets/icons/settings.svg?raw";
  import undo from "../assets/icons/undo.svg?raw";
  import upload from "../assets/icons/upload.svg?raw";

  const icons = {
    arrowDown,
    arrowUp,
    copy,
    cropRotateTl,
    cut,
    deleteCircle,
    diceFive,
    door,
    download,
    drag,
    editPencil,
    emptyPage,
    erase,
    eyeEmpty,
    eyeOff,
    fillColor,
    flipHoriz,
    flipVert,
    gitMerge,
    hexagonDice,
    magicWand,
    minus,
    openSelectHandGesture,
    pasteClipboard,
    plus,
    redo,
    refresh,
    saveFloppyDisk,
    settings,
    undo,
    upload,
  };

  export let name: keyof typeof icons;
</script>

{@html icons[name]}
