# GAMES202 

update: 2023-06-20 finish Assignment0

### Assignment1

1. Shadow Map

实现硬阴影：
<center>
    <img src="pic/2023_7_14_1.png" width = 1000>
</center>
存在大量锯齿及自遮挡：
<center class="half">
    <img src="pic/2023_7_14_2.png" width = 500>
    <img src="pic/2023_7_14_3.png" width = 500>
</center>
增加一个bias可以改善自遮挡现象，但无法解决锯齿，且会出现影子与物体分离的情况：
<center class="half">
    <img src="pic/2023_7_14_4.png" width = 500>
    <img src="pic/2023_7_14_5.png" width = 500>
</center>

2. PCF
本身是做一个滤波来解决锯齿的现象：
<center class="half">
    <img src="pic/2023_7_14_6.png" width = 500>
    <img src="pic/2023_7_14_7.png" width = 500>
</center>
也可以用来做软阴影，当filter size变大时：
<center>
    <img src="pic/2023_7_14_8.png" width = 1000>
</center>
阴影也呈现更软，但是图片的噪声会增加

3. PCSS

可以看到近处和远处的阴影是从硬到软的，但是存在大量噪声尤其是边缘
<center class="half">
    <img src="pic/2023_7_16_1.png" width = 500>
    <img src="pic/2023_7_16_2.png" width = 500></br>
(shadowMap query area size: 100/2048（左）      20/2048（右）)
</center>
增大采样数可以减少噪声，但是平面上边缘仍有大量噪声，且影子有明显的分层：
<center class="half">
    <img src="pic/2023_7_16_1.png" width = 500>
    <img src="pic/2023_7_16_3.png" width = 500></br>
(sample num: 20（左）      50（右）)
</center>

平台边缘的噪声是因为shadowMap中默认背景值为0， 调整为最远距离1即可
明显分层在将采样方法从uniform改为泊松采样后有所改善：
增大采样数可以减少噪声，但是平面上边缘仍有大量噪声，且影子有明显的分层：
<center class="half">
    <img src="pic/2023_7_16_5.png" width = 500>
    <img src="pic/2023_7_16_4.png" width = 500></br>
(uniform sample（左）      poission sample（右）)
</center>

### Assignment 2

1. 预计算（Bonus： InterReflection）
<center class="half">
    <img src="pic/2023_7_19_1.png" width = 500>
    <img src="pic/2023_7_19_2.png" width = 500>
    </br>
(shadow（左）      inter reflection(Bounces: 5)（右）)
</center>
<center>
<img src="pic/2023_7_19_3.png" width = 1000>
</center>

2. 实时光照计算

<center class="half">
    <img src="pic/2023_7_19_4.png" width = 250>
    <img src="pic/2023_7_19_5.png" width = 250>
    <img src="pic/2023_7_19_6.png" width = 250>
    <img src="pic/2023_7_19_7.png" width = 250>
</center>

3. 环境光球谐旋转(Bounus)
<center class="half">
    <img src="pic/2023_7_19_8.png" width = 250>
    <img src="pic/2023_7_19_9.png" width = 250>
    <img src="pic/2023_7_19_10.png" width = 250>
    <img src="pic/2023_7_19_11.png" width = 250>
</center>


### Assignment3

<center class="half">
    <img src="pic/2023_7_25_1.png" width = 1000>
    </br>
    直接光照
</center>

<center class="half">
    <img src="pic/2023_7_25_2.png" width = 300>
    <img src="pic/2023_7_25_3.png" width = 300>
    <img src="pic/2023_7_25_4.png" width = 300>
    </br>
    (Sample Num: 1(左)     10(中)      100(右))
    </br>
    直接光照+SSR间接光照
</center>

### Assignment4

1. 预计算
<center class="half">
    <img src="pic/2023_7_25_5.png" width = 500>
    <img src="pic/2023_7_25_6.png" width = 500>
    </br>
    Emu（左）        Eavg（右）
</center>

2. Kulla-Conty 材质
上面一行模型为经过Kulla-Conty补充能量损失后的结果
<center class="half">
    <img src="pic/2023_7_25_7.png" width = 1000>
</center>