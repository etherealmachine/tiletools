<script lang="ts">
  import download from "./icons/download.svg?raw";
  import editPencil from "./icons/edit-pencil.svg?raw";
  import eyeEmpty from "./icons/eye-empty.svg?raw";
  import eyeOff from "./icons/eye-off.svg?raw";
  import minus from "./icons/minus.svg?raw";
  import plus from "./icons/plus.svg?raw";
  import upload from "./icons/upload.svg?raw";

  const icons: { [key: string]: string } = {
    download,
    editPencil,
    eyeEmpty,
    eyeOff,
    minus,
    plus,
    upload,
  };

  export let name: string;
</script>

{@html icons[name]}
