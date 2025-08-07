<?php

namespace tbi;

use Craft;
use yii\base\Module as BaseModule;
use tbi\twigextensions\Extension;

/**
 * tool-box module
 *
 * @method static Module getInstance()
 */
class ToolBox extends BaseModule
{
    public function init(): void
    {
        Craft::setAlias('@tbi', __DIR__);

        /*// Set the controllerNamespace based on whether this is a console or web request*/
        /*if (Craft::$app->request->isConsoleRequest) {*/
        /*$this->controllerNamespace = 'modules\\console\\controllers';*/
        /*} else {*/
        /*$this->controllerNamespace = 'modules\\controllers';*/
        /*}*/

        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'tbi\\console\\controllers';
        } else {
            $this->controllerNamespace = 'tbi\\controllers';
        }

        parent::init();

        Craft::$app->onInit(function () {
            $this->attachEventHandlers();
        });
    }

    private function attachEventHandlers(): void
    {
        Craft::$app->getView()->registerTwigExtension(new Extension);
    }
}
