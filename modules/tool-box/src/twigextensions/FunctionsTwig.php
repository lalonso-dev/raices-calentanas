<?php

namespace tbi\twigextensions;

use tbi\twigextensions\BaseExtension;

use Craft;
use craft\helpers\ArrayHelper;

class FunctionsTwig extends BaseExtension
{

    public function __construct()
    {
        $this->functions = [
            "getHandle" => [$this, 'getHandle'],
            "getMP" => [$this, 'getMP'],
            "existElement" => [$this, 'existElement'],
            "injectJs" => [$this, 'injectJs'],
            "jsBlocks" => [$this, 'jsBlocks'],
            "injectCss" => [$this, 'injectCss'],
            "getSegmentFunction" => [$this, "getSegmentFunction"]
        ];
    }

    public function existElement(string $path): bool
    {
        if (!file_exists(CRAFT_BASE_PATH . $path)) {
            return false;
        }
        return true;
    }

    public function getHandle(): string
    {
        return str_replace(' ', '-', strtolower($this->getName()));
    }

    public function getName(): string
    {
        return 'Tool Box';
    }

    public function injectCss(string $path, bool $inFile = false): void
    {
        $pathFile = "/web/" . $path;
        $inFile = $inFile ?? false;

        if (!$this->existElement($pathFile)) {
            return;
        }

        if ($inFile) {
            Craft::$app->view->registerCssFile($path, [], null);
        } else {
            $cssContent = trim(file_get_contents(CRAFT_BASE_PATH . $pathFile));
            if (strlen($cssContent) == 0) {
                return;
            }
            Craft::$app->view->registerCss(
                $cssContent,
                [],
                null
            );
        }

        return;
    }

    public function injectJs(array $element): void
    {
        $path = $element["path"];
        $key = $element["key"] ?? null;
        $externalLink = $element["externalLink"] ?? false;
        $existFile = $externalLink ? true : $this->existElement("/web/" . $path);
        $options = $element["options"] ?? [];
        $positions = [
            "HEAD" => 1,
            "BEGIN" => 2,
            "END" => 3,
        ];
        $position = $positions[$element["position"] ?? ""] ?? '';

        if (!$existFile) {
            return;
        }

        if (!empty($position)) {
            $options["position"] = $position;
        }

        Craft::$app->view->registerJsFile($path, $options, $key);
        return;
    }


    public function jsBlocks(array $files = []): void
    {
        if (empty($files)) {
            return;
        }
        foreach ($files as $file) {
            $this->injectJs($file);
        }
        return;
    }

    public function getMP($children): string
    {
        $defaultClasses = "my-4 py-4";
        $devices = [];
        if (empty($children)) {
            return $defaultClasses;
        }
        $classMap = [
            "xSmall" => "-",
            "small" => "-sm-",
            "large" => "-lg-",
            "xLarge" => "-xl-",
        ];
        $properties = ["mt", "mb", "pt", "pb"];
        foreach ($children as $child) {
            $handle = $child->type->handle ?? null;

            if ($handle && isset($classMap[$handle])) {
                $key = $classMap[$handle];
                foreach ($properties as $property) {
                    $value = $child->{$property}->value ?? null;
                    if (is_numeric($value)) {
                        $devices[] = sprintf("%s%s%s", $property, $key, $value);
                    }
                }
            }
        }
        return empty($devices) ? $defaultClasses : implode(" ", $devices);
    }

    public function getSegmentFunction(array $paramets): string
    {
        if (empty($paramets['url']) || empty($paramets['num'])) {
            return '';
        }

        $num = $paramets['num'];
        $path = parse_url($paramets['url'], PHP_URL_PATH);

        if (!$path) {
            return '';
        }

        $segments = $this->getSegments($path);
        $totalSegs = count($segments);

        if ($num > 0 && isset($segments[$num - 1])) {
            return $segments[$num - 1];
        } elseif ($num < 0 && isset($segments[$totalSegs + $num])) {
            return $segments[$totalSegs + $num];
        }

        return '';
    }
    private function getSegments(string $path): array
    {
        return array_values(
            ArrayHelper::filterEmptyStringsFromArray(explode("/", $path))
        );
    }
}
