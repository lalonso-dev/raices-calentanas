<?php

namespace tbi\twigextensions;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Twig\TwigFilter;

use tbi\twigextensions\FunctionsTwig;
use tbi\twigextensions\FiltersTwig;


class Extension extends AbstractExtension
{


    public function getFunctions(): array
    {
        $twigFunctions = [];
        $functionsInstance = new FunctionsTwig();
        foreach ($functionsInstance->functions as $name => $function) {
            $twigFunctions[] = new TwigFunction($name, $function);
        }
        return $twigFunctions;
    }

    public function getFilters()
    {
        $twigFilters = [];
        $filtersInstance = new FiltersTwig();
        foreach ($filtersInstance->filters as $name => $function) {
            $twigFilters[] = new TwigFilter($name, $function);
        }
        return $twigFilters;
    }
}
