# Flaq Creator

Flaq Creator organizes the media people provide to generation tools and the work those tools produce.

## Language

**素材**: An item known to this installation that can be viewed or reused, whether or not it currently has a local file
copy. _Avoid_: Local file, history item

**参考素材**: A user-provided image, video, audio file, or other input that has been uploaded successfully for use in
generation. _Avoid_: Source file, attachment

**生成作品**: An image or video whose remote generation task completed successfully, including one whose local archive
later failed. _Avoid_: Download, local result

**本地归档**: A durable file copy of a generated work stored in the configured media directory. It is distinct from the
generated work itself and from a manual save-as download. _Avoid_: Generated work, download

**素材目录**: The device-local index of known reference media and generated works. It records and presents media but
does not imply ownership of, or permission to delete, the corresponding local or remote object. _Avoid_: Local folder,
cloud library

**生成任务**: A remote request for an image or video, tracked from submission until a successful or failed terminal
result. _Avoid_: Local archive, download

**生成记录**: The device-local history entry that represents a generation task and its latest known outcome. Image and
video records may retain different stored shapes while sharing the same lifecycle semantics. _Avoid_: Generated work,
task response

**归档恢复**: A retry that creates the missing local archive for an already successful generated work. It never submits
another generation task. _Avoid_: Task retry, regeneration

**内置图床**: The Flaq-managed object storage provider selected by default for reference media uploads. Its uploaded
objects are represented to generation tasks by public URLs. _Avoid_: Local archive, custom storage

**自定义图床**: A user-managed R2 provider whose account, bucket, credentials, and public domain are configured on that
device. _Avoid_: Built-in storage, media directory

**上传授权**: The temporary permission used to place one reference object in the selected image hosting provider. It is
distinct from the public URL later sent to a generation task. _Avoid_: Client Key, public URL
