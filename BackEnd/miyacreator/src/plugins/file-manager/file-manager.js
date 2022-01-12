import { exporter } from './exporter';
import { loader } from './loader';
import { AbstractPlugin } from '../../core/plugin.abstract';

export class FileManager extends AbstractPlugin {
  static meta = {
    name: 'file-manager',
  };

  constructor(configs) {
    super(configs);

    const menuItems = document.querySelectorAll('.plugin-file-manager');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => this.dispatchEvent(event, item.dataset.event));
    });

    this.fakeLink = document.createElement('a');
    this.fakeLink.style.display = 'none';
    document.body.appendChild(this.fakeLink);

    this.fakeInput = document.createElement('input');
    this.fakeInput.type = 'file';
    this.fakeInput.accept = '.vxl';
    this.fakeInput.style.display = 'none';
    document.body.appendChild(this.fakeInput);

    this.fakeInput.addEventListener('change', (event) => this.fileSelected(event));
  }

  dispatchEvent(event, eventName) {
    console.log('dispatchEvent: ' + eventName);
    switch (eventName) {
      case 'new':
        this.handleNew();
        break;
      case 'filesave':
        this.handleSave();
        break;
      case 'fileopen':
        this.handleOpen();
        break;
      case 'dbsave':
        this.dbSave();
        break;       
      case 'dbopen':
        this.dbOpen();
        break;
      default:
        break;
    }
  }

  clearScene() {
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;
    scene.remove(...sceneObjects);
    sceneObjects.splice(0, sceneObjects.length);
  }

  handleNew() {
    console.log('handleNew!');
    if (window.confirm('Are you sure you want to create a new file?')) {
      this.clearScene();
      this.configs.render();
    }
  }

  handleSave() {
    console.log('handleSave!');
    const data = exporter(this.configs.sceneObjects);
    const output = JSON.stringify(data, null, 2);
    console.log(output);    
    this.fakeLink.href = URL.createObjectURL(new Blob([output], { type: 'text/plain' }));
    this.fakeLink.download = 'scene.vxl';
    this.fakeLink.click();    
  }

  handleOpen() {
    console.log('handleOpen!');
    this.fakeInput.click();
  }

  dbSave() {
    const data = exporter(this.configs.sceneObjects);
    const output = JSON.stringify(data, null, 2);
    console.log(output);
    //front app server 전달 (json)
    fetch("http://10.157.15.19:8081/save", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
      },
      body: output,    
    })
    .then(res => res.json())
    .then(res => {
      //callback 예외처리 ToDO
      console.log(res.result + " " + res.data);
    })
  }

  dbOpen() {
    console.log('dbOpen!');    
    fetch('http://10.157.15.19:8081/load', {
      method: 'post',
    })
    .then(res => res.json())
    .then(res => {
      //callback 예외처리 ToDO
      console.log(res.result + " " + res.data);
      
      if (res.result == 'success') {    

        const { THREE } = this.configs;
        const { scene } = this.configs;
        const { sceneObjects } = this.configs;

        const reader = new FileReader();
        //byte 형태로 변경 후 걍 넣음, 된다.
        reader.readAsText(new Blob([res.data], { type: 'text/plain' }));

        reader.onload = () => {
          this.clearScene();

          const data = loader(THREE, reader.result);
          data.forEach((voxel) => {
            scene.add(voxel);
            sceneObjects.push(voxel);
          });
          this.configs.render();
        };
      } else {
        
      }

    })
  }

  fileSelected(event) {
    const { files } = event.target;
    const { THREE } = this.configs;
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    if (files && files.length) {
      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = () => {
        this.clearScene();

        const data = loader(THREE, reader.result);
        data.forEach((voxel) => {
          scene.add(voxel);
          sceneObjects.push(voxel);
        });
        this.configs.render();
      };
    }
    event.target.value = null;
  }
}
