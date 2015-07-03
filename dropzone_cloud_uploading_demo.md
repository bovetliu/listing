#asdf

```
  var myDropzone = new Dropzone('#dropzone-container', { // Make the whole body a dropzone
    url: "/edit/5593aa9e48f2890a9a0f2929/upload_image", // Set the url
    thumbnailWidth: 120,
    thumbnailHeight: 120,
    parallelUploads: 20,
    previewTemplate: previewTemplate,
    autoQueue: false, // Make sure the files aren't queued until manually added
    // autoProcessQueue:false,
    parallelUploads:2,
    uploadMultiple:true,
    previewsContainer: "#previews", // Define the container to display the previews
    clickable: ".fileinput-button", // Define the element that should be used as click trigger to select files.
    init:function(){
    }
  });
```
