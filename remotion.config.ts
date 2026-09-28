import {Config} from '@remotion/cli/config';

// Kuvattu materiaali, ruutukaappaukset, äänet ja logo luetaan assets/-kansiosta
Config.setPublicDir('assets');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
