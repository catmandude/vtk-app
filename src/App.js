import React, { Component } from 'react';
import './App.css';

import 'vtk.js/Sources/favicon';

import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';

class App extends Component {
  constructor(props) {
    super(props);

    this.fullScreenRenderer = null;
    this.container = React.createRef();
    this.pipeline = null;
  }

  createPipeline(resolution = 20, renderer, renderWindow) {
    const reader = vtkHttpDataSetReader.newInstance(); //spheresource

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setSampleDistance(0.7);
    actor.setMapper(mapper);

    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.addRGBPoint(200.0, 0.4, 0.2, 0.0);
    ctfun.addRGBPoint(2000.0, 1.0, 1.0, 1.0);
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(200.0, 0.0);
    ofun.addPoint(1200.0, 0.5);
    ofun.addPoint(3000.0, 0.8);
    actor.getProperty().setRGBTransferFunction(0, ctfun);
    actor.getProperty().setScalarOpacity(0, ofun);
    actor.getProperty().setScalarOpacityUnitDistance(0, 4.5);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setUseGradientOpacity(0, true);
    actor.getProperty().setGradientOpacityMinimumValue(0, 15);
    actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
    actor.getProperty().setGradientOpacityMaximumValue(0, 100);
    actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
    actor.getProperty().setShade(true);
    actor.getProperty().setAmbient(0.2);
    actor.getProperty().setDiffuse(0.7);
    actor.getProperty().setSpecular(0.3);
    actor.getProperty().setSpecularPower(8.0);

    mapper.setInputConnection(reader.getOutputPort());


    reader
        .setUrl(
            'https://data.kitware.com/api/v1/file/58e79a8b8d777f16d095fcd7/download',
            { fullPath: true, compression: 'zip', loadData: true }
        )
        .then(() => {
          renderer.addVolume(actor);
          renderer.resetCamera();
          renderer.getActiveCamera().zoom(1.5);
          renderer.getActiveCamera().elevation(70);
          renderer.updateLightsGeometryToFollowCamera();
          renderWindow.render();
          // now that the small dataset is loaded we pull down the
          // full resolution 256x256x91 dataset
          reader
              .setUrl(
                  'https://data.kitware.com/api/v1/file/58e665158d777f16d095fc2e/download',
                  { fullPath: true, compression: 'zip', loadData: true }
              )
              .then(() => {
                renderWindow.render();
              });
        });
  }

  updatePipeline() {
    const renderer = this.fullScreenRenderer.getRenderer();
    const renderWindow = this.fullScreenRenderer.getRenderWindow();

    if (this.pipeline) {
      renderer.removeActor(this.pipeline.actor);
      this.pipeline = null;
    }

    const resolution = this.props.resolution || 40
    this.pipeline = this.createPipeline(resolution, renderer, renderWindow);
    renderWindow.render();

    const camera = renderer.getActiveCamera();
    camera.elevation(30.)
    camera.azimuth(30.)

    window.pipeline = this.pipeline;

    renderWindow.render();
  }

  componentDidMount() {
    this.fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
    });

    this.updatePipeline();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resolution !== this.props.resolution) {
      this.updatePipeline();
    }
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <div ref={this.container} />
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://kitware.github.io/vtk-js/docs/"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn vtk.js
            </a>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn React
            </a>
            <a
                className="App-link"
                href="https://github.com/sharegate/craco"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn craco
            </a>
          </header>
        </div>
    );
  }
}

export default App;
