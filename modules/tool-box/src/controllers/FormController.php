<?php

namespace tbi\controllers;

use craft\web\Controller;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class FormController extends Controller
{
    protected array|bool|int $allowAnonymous = true;

    public function actionIndex(): string
    {
        return 'Welcome to the Craft Freeform Form Controller';
    }

    public function actionProperties(string $formHandle): Response
    {
        $form = Freeform::getInstance()->forms->getFormByHandle($formHandle);

        if ($form) {
            return $this->asJson($form->toArray());
        }

        return $this->asJson(['message' => 'Form was not found']);
    }
}
