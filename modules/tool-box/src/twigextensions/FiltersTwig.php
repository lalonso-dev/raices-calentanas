<?php

namespace tbi\twigextensions;

use tbi\twigextensions\BaseExtension;

class FiltersTwig extends BaseExtension
{

    public function __construct()
    {
        //Example of array filters
        // $this->filters = [
        //    "getHandle" => [$this, 'getHandle']
        // ];

        $this->filters = [];
    }

    //All your filters
}
