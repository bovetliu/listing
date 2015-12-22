## Listing Service Compoenent of EasySublease
#### How it works English Version and 中文:

English Version
Website URL http://www.easysublease.com

Students have two important factors in their daily life, 1.apartments and 2.cars. I focus on apartments first, hoping to simplify process of subleasing one apartment and find one. So today I would like to introduce my personal project EasySublease.com. EasySublease is developed by one graduate student in Computer Engineering of Texas A&M. This readme mainly introduces features "right click on map to post" and "in-page editing". They are only features I implemented yet.

Following is the main map of EasySublease. Above the map is the filter. One the map, we can know the titles and categories of each listing. Blue markers means subleasing, Red ones means seeking apartments, and green ones means seeking co-lessees. Some other living utilities like school transit routes are also marked (the routes currently are hard-coded, but I have already implemented CRUD of MVCObjects on another project:[Fire Ant Spatial Information](http://fasids-u7yhjm.rhcloud.com/) ).  


![Alt main map](https://boweiliu.files.wordpress.com/2015/12/01indexmap.jpg?w=998 "Optional title")

Then click on marker on map to enter listing page
![Alt listing page](https://boweiliu.files.wordpress.com/2015/12/02listingpage.jpg?w=998 "Optional title")

I carefully studied listing page of Airbnb. It is one process of learning.
Major innovation is done on how listing owner can edit listing page. I extended dropzone.js so it can drag and drop pictures to Amazon S3. By clicking titles and introductions, One can directly edit and save it. Think about how Linkedin profile works.  

![Alt edit listing page](https://boweiliu.files.wordpress.com/2015/12/03listingedit.jpg?w=998 "Optional title")

Introduction is over, the purpose of this Readme is looking for some friends so we can make this site more complete and benefit more people. Also it is for the convenience of interviewers who want to know more detail about this project.

Main App program: https://github.com/bovetliu/listing

Self-authored Map Customizing Tool：https://github.com/bovetliu/mapcover

中文版本:
网址 http://www.easysublease.com

写在前面, 留学生初来陌生地, 生活中重要两件事是"找房"与"车", EasySublease希望能够着眼这两件事,简化一下流程.方便一下众人. EasySublease是Texas A&M U. Computer Eng. 一在读研究生的课余兴趣项目. 本Readme主要介绍"在地图右键发布房源，和在房源页面直接编辑"的功能。这也是目前唯一基本实现的功能， 用户系统一点都没做。

以下是easysublease的主页地图，可以看到每个房源的标题和房源的性质。地图上方是过滤器。地图中颜色标出校车线路，和官方的校车线路保持一致。分别代表我想在地图上呈现的两个要素：1.带标题的房源信息 2. 便利生活的一些要素（现在这块元素是硬写在代码里面的，但是互动性质的画图保存功能我在另外一个学校的项目里面开发了一部分，到时候可以拿一些代码过来http://fasids-u7yhjm.rhcloud.com/）
![Alt text](https://boweiliu.files.wordpress.com/2015/12/01indexmap.jpg?w=998 "Optional title")
点击图标进入具体的房源页面
![Alt text](https://boweiliu.files.wordpress.com/2015/12/02listingpage.jpg?w=998 "Optional title")
我是仔仔细细研究了Airbnb的页面。仔细到几乎是逆向过程，也是一个学习的过程。

主要的创新在房源主人的对自己房源信息编辑方式，扩展了dropzone.js的，让它可以直接拖拽图片上传到amazon s3， 点击很多比如标题等元素，可以直接替换出编辑框，save后，编辑后的效果就直接显示。03listingedit.jpg
![Alt text](https://boweiliu.files.wordpress.com/2015/12/03listingedit.jpg?w=998 "Optional title")
介绍完毕，我发帖的目的在于寻找一些志同道合的朋友，大家一起把这这些想法实现。gihub地址在

主程序 https://github.com/bovetliu/listing

自写深度定制地图UI辅助工具：https://github.com/bovetliu/mapcover
