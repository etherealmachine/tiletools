<script lang="ts">
  import download from "../assets/icons/download.svg?raw";
  import editPencil from "../assets/icons/edit-pencil.svg?raw";
  import erase from "../assets/icons/erase.svg?raw";
  import eyeEmpty from "../assets/icons/eye-empty.svg?raw";
  import eyeOff from "../assets/icons/eye-off.svg?raw";
  import minus from "../assets/icons/minus.svg?raw";
  import plus from "../assets/icons/plus.svg?raw";
  import saveFloppyDisk from "../assets/icons/save-floppy-disk.svg?raw";
  import settings from "../assets/icons/settings.svg?raw";
  import upload from "../assets/icons/upload.svg?raw";

  const icons: { [key: string]: string } = {
    download,
    editPencil,
    erase,
    eyeEmpty,
    eyeOff,
    minus,
    plus,
    saveFloppyDisk,
    settings,
    upload,
  };

  export let name: string;
</script>

{@html icons[name]}
